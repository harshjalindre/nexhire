import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";

const tenantSchema = z.object({ name: z.string().min(3), code: z.string().min(3).max(10).regex(/^[A-Z0-9]+$/), adminEmail: z.string().email(), tier: z.enum(["basic", "premium", "enterprise"]).default("basic") });

export async function tenantRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", async (req, reply) => {
    if (req.currentUser.role !== "super_admin") return reply.code(403).send({ message: "Forbidden" });
    const pagination = getPagination(req);
    const [data, total] = await Promise.all([prisma.tenant.findMany({ include: { _count: { select: { users: true, drives: true, students: true } } }, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.limit }), prisma.tenant.count()]);
    const mapped = data.map((t) => ({ id: t.id, name: t.name, code: t.code, logo: t.logo, tier: t.tier, status: t.status, studentsCount: t._count.students, drivesCount: t._count.drives, adminEmail: "", createdAt: t.createdAt.toISOString() }));
    return reply.send(paginatedResponse(mapped, total, pagination));
  });

  fastify.post("/", async (req, reply) => {
    if (req.currentUser.role !== "super_admin") return reply.code(403).send({ message: "Forbidden" });
    const result = tenantSchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed" });
    const existing = await prisma.tenant.findUnique({ where: { code: result.data.code } });
    if (existing) return reply.code(409).send({ message: "Tenant code already exists" });
    const tenant = await prisma.tenant.create({ data: { name: result.data.name, code: result.data.code, tier: result.data.tier } });
    await logAudit(req, "create", "tenant", tenant.id);
    return reply.code(201).send(tenant);
  });

  fastify.put("/:id", async (req, reply) => {
    if (req.currentUser.role !== "super_admin") return reply.code(403).send({ message: "Forbidden" });
    const { id } = req.params as { id: string };
    const result = tenantSchema.partial().safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed" });
    const tenant = await prisma.tenant.update({ where: { id }, data: result.data });
    await logAudit(req, "update", "tenant", id);
    return reply.send(tenant);
  });

  fastify.delete("/:id", async (req, reply) => {
    if (req.currentUser.role !== "super_admin") return reply.code(403).send({ message: "Forbidden" });
    const { id } = req.params as { id: string };
    await prisma.tenant.delete({ where: { id } });
    await logAudit(req, "delete", "tenant", id);
    return reply.code(204).send();
  });
}
