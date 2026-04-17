import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { promises as fs } from "fs";
import path from "path";

const updateProfileSchema = z.object({ name: z.string().min(2).optional(), branch: z.string().optional(), year: z.number().int().min(1).max(5).optional(), cgpa: z.number().min(0).max(10).optional(), backlogs: z.number().int().min(0).optional(), skills: z.array(z.string()).optional() });

function calcCompletion(student: Record<string, unknown>): number {
  let score = 10;
  if (student.branch) score += 15; if (student.cgpa && (student.cgpa as number) > 0) score += 15; if (student.year) score += 10;
  const skills = student.skills as string[]; if (skills && skills.length > 0) score += 20; if (student.resumeUrl) score += 20; if (student.name) score += 10;
  return Math.min(100, score);
}

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", async (req, reply) => {
    const student = await prisma.student.findUnique({ where: { userId: req.currentUser.id }, include: { user: { select: { name: true, email: true, avatar: true } } } });
    if (!student) return reply.code(404).send({ message: "Profile not found" });
    return reply.send({ ...student, name: student.user.name, email: student.user.email, avatar: student.user.avatar });
  });

  fastify.put("/", async (req, reply) => {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    const { name, ...studentData } = result.data;
    if (name) await prisma.user.update({ where: { id: req.currentUser.id }, data: { name } });
    const current = await prisma.student.findUnique({ where: { userId: req.currentUser.id } });
    if (!current) return reply.code(404).send({ message: "Profile not found" });
    const merged = { ...current, ...studentData, name };
    const profileCompletion = calcCompletion(merged as unknown as Record<string, unknown>);
    const updated = await prisma.student.update({ where: { userId: req.currentUser.id }, data: { ...studentData, profileCompletion } });
    return reply.send(updated);
  });

  fastify.post("/resume", async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.code(400).send({ message: "No file uploaded" });
    const ext = path.extname(data.filename).toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(ext)) return reply.code(400).send({ message: "Only PDF, DOC, DOCX files are allowed" });
    const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileName = `${req.currentUser.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const buffer = await data.toBuffer();
    await fs.writeFile(filePath, buffer);
    const resumeUrl = `/uploads/resumes/${fileName}`;
    const student = await prisma.student.update({ where: { userId: req.currentUser.id }, data: { resumeUrl } });
    return reply.send({ message: "Resume uploaded", resumeUrl: student.resumeUrl });
  });

  // GDPR data export
  fastify.get("/export", async (req, reply) => {
    const user = await prisma.user.findUnique({ where: { id: req.currentUser.id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
    const student = await prisma.student.findUnique({ where: { userId: req.currentUser.id }, include: { applications: { include: { drive: { select: { title: true, company: { select: { name: true } } } } } } } });
    const notifications = await prisma.notification.findMany({ where: { userId: req.currentUser.id } });
    const auditLogs = await prisma.auditLog.findMany({ where: { userId: req.currentUser.id }, orderBy: { createdAt: "desc" }, take: 100 });
    reply.header("Content-Type", "application/json");
    reply.header("Content-Disposition", "attachment; filename=my-data-export.json");
    return reply.send({ exportDate: new Date().toISOString(), user, student, notifications, auditLogs });
  });
}
