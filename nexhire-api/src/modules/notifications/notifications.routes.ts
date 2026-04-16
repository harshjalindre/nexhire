import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", async (req, reply) => {
    const pagination = getPagination(req);
    const query = req.query as Record<string, string>;
    const where: Record<string, unknown> = { userId: req.currentUser.id };
    if (query.read === "false") where.read = false;
    if (query.read === "true") where.read = true;
    const [data, total] = await Promise.all([prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.limit }), prisma.notification.count({ where })]);
    return reply.send(paginatedResponse(data, total, pagination));
  });

  fastify.put("/:id/read", async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.notification.updateMany({ where: { id, userId: req.currentUser.id }, data: { read: true } });
    return reply.send({ message: "Marked as read" });
  });

  fastify.put("/read-all", async (req, reply) => {
    await prisma.notification.updateMany({ where: { userId: req.currentUser.id, read: false }, data: { read: true } });
    return reply.send({ message: "All notifications marked as read" });
  });
}
