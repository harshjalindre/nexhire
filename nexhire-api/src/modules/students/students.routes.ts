import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";

export async function studentRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);
  fastify.addHook("onRequest", fastify.tenantGuard);

  fastify.get("/", async (req, reply) => {
    const query = req.query as Record<string, string>;
    const pagination = getPagination(req);
    const where: Record<string, unknown> = { tenantId: req.tenantId };
    if (query.branch) where.branch = query.branch;
    if (query.placementStatus) where.placementStatus = query.placementStatus;
    if (query.search) where.user = { name: { contains: query.search } };
    const [data, total] = await Promise.all([prisma.student.findMany({ where, include: { user: { select: { name: true, email: true, avatar: true } } }, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.limit }), prisma.student.count({ where })]);
    const mapped = data.map((s) => ({ id: s.id, userId: s.userId, name: s.user.name, email: s.user.email, avatar: s.user.avatar, branch: s.branch, year: s.year, cgpa: s.cgpa, backlogs: s.backlogs, skills: s.skills as string[], placementStatus: s.placementStatus, profileCompletion: s.profileCompletion, createdAt: s.createdAt.toISOString() }));
    return reply.send(paginatedResponse(mapped, total, pagination));
  });

  fastify.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const student = await prisma.student.findFirst({ where: { id, tenantId: req.tenantId }, include: { user: { select: { name: true, email: true, avatar: true } } } });
    if (!student) return reply.code(404).send({ message: "Student not found" });
    return reply.send({ ...student, name: student.user.name, email: student.user.email });
  });
}
