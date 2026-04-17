import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);
  fastify.addHook("onRequest", fastify.tenantGuard);

  fastify.get("/", async (req, reply) => {
    if (!["college_admin", "super_admin"].includes(req.currentUser.role)) return reply.code(403).send({ message: "Forbidden" });
    const query = req.query as Record<string, string>;
    const pagination = getPagination(req);
    const where: Record<string, unknown> = {};

    // Super admin sees all, college admin sees own tenant's users only
    if (req.currentUser.role === "college_admin") {
      const tenantUsers = await prisma.user.findMany({ where: { tenantId: req.tenantId }, select: { id: true } });
      where.userId = { in: tenantUsers.map(u => u.id) };
    }
    if (query.action) where.action = { contains: query.action, mode: "insensitive" };
    if (query.entity) where.entity = query.entity;
    if (query.userId) where.userId = query.userId;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, include: { user: { select: { name: true, email: true, role: true } } }, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.limit }),
      prisma.auditLog.count({ where }),
    ]);

    const mapped = data.map(log => ({
      id: log.id,
      userName: log.user.name,
      userEmail: log.user.email,
      userRole: log.user.role,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      meta: log.meta,
      ip: log.ip,
      createdAt: log.createdAt.toISOString(),
    }));

    return reply.send(paginatedResponse(mapped, total, pagination));
  });
}
