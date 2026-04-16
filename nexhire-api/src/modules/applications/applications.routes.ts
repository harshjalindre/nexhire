import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";

export async function applicationRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", async (req, reply) => {
    const query = req.query as Record<string, string>;
    const pagination = getPagination(req);
    const student = await prisma.student.findUnique({ where: { userId: req.currentUser.id } });
    if (!student) return reply.code(400).send({ message: "Student profile not found" });
    const where: Record<string, unknown> = { studentId: student.id };
    if (query.status) where.status = query.status;
    const [data, total] = await Promise.all([prisma.application.findMany({ where, include: { drive: { include: { company: { select: { name: true, logo: true } } } } }, orderBy: { appliedAt: "desc" }, skip: pagination.skip, take: pagination.limit }), prisma.application.count({ where })]);
    const mapped = data.map((a) => ({ id: a.id, driveId: a.driveId, driveTitle: a.drive.title, companyName: a.drive.company.name, companyLogo: a.drive.company.logo, status: a.status, appliedAt: a.appliedAt.toISOString(), roundStatuses: a.roundStatuses as unknown[], packageLpa: a.drive.packageLpa }));
    return reply.send(paginatedResponse(mapped, total, pagination));
  });

  fastify.post("/:id/withdraw", async (req, reply) => {
    const { id } = req.params as { id: string };
    const student = await prisma.student.findUnique({ where: { userId: req.currentUser.id } });
    if (!student) return reply.code(400).send({ message: "Student profile not found" });
    const application = await prisma.application.findFirst({ where: { id, studentId: student.id } });
    if (!application) return reply.code(404).send({ message: "Application not found" });
    if (application.status !== "applied") return reply.code(400).send({ message: "Can only withdraw pending applications" });
    await prisma.application.update({ where: { id }, data: { status: "withdrawn" } });
    return reply.send({ message: "Application withdrawn" });
  });
}
