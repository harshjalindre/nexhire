import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";

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
    const student = await prisma.student.update({ where: { userId: req.currentUser.id }, data: { resumeUrl: `/uploads/resumes/${req.currentUser.id}.pdf` } });
    return reply.send({ message: "Resume uploaded", resumeUrl: student.resumeUrl });
  });
}
