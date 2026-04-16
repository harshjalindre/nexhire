import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import type { FastifyRequest } from "fastify";

export async function logAudit(req: FastifyRequest, action: string, entity: string, entityId?: string, meta?: Record<string, unknown>) {
  try { await prisma.auditLog.create({ data: { userId: req.currentUser.id, action, entity, entityId, meta: meta ?? undefined, ip: req.ip } }); }
  catch (err) { logger.error(err, "Failed to create audit log"); }
}
