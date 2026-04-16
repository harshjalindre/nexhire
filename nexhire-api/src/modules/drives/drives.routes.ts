import type { FastifyInstance } from "fastify";
import { createDriveSchema, updateDriveSchema } from "./drives.schema.js";
import * as service from "./drives.service.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";
import { AppError } from "../../utils/errors.js";
import { logAudit } from "../../utils/audit.js";

export async function driveRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);
  fastify.addHook("onRequest", fastify.tenantGuard);

  fastify.get("/", async (req, reply) => {
    const query = req.query as Record<string, string>;
    const pagination = getPagination(req);
    const result = await service.getDrives(req.tenantId, { status: query.status, branch: query.branch, search: query.search, skip: pagination.skip, limit: pagination.limit });
    return reply.send(paginatedResponse(result.data, result.total, pagination));
  });

  fastify.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try { const drive = await service.getDrive(id, req.tenantId); return reply.send(drive); }
    catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/", async (req, reply) => {
    const result = createDriveSchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    const drive = await service.createDrive(req.tenantId, result.data);
    await logAudit(req, "create", "drive", drive.id);
    return reply.code(201).send(drive);
  });

  fastify.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = updateDriveSchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    try { const drive = await service.updateDrive(id, req.tenantId, result.data); await logAudit(req, "update", "drive", id); return reply.send(drive); }
    catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try { await service.deleteDrive(id, req.tenantId); await logAudit(req, "delete", "drive", id); return reply.code(204).send(); }
    catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/:id/apply", async (req, reply) => {
    const { id } = req.params as { id: string };
    const { prisma } = await import("../../config/prisma.js");
    const student = await prisma.student.findUnique({ where: { userId: req.currentUser.id } });
    if (!student) return reply.code(400).send({ message: "Student profile not found" });
    const drive = await service.getDrive(id, req.tenantId);
    if (student.cgpa < drive.minCgpa) return reply.code(400).send({ message: "CGPA requirement not met" });
    if (student.backlogs > drive.maxBacklogs) return reply.code(400).send({ message: "Too many backlogs" });
    const application = await prisma.application.create({ data: { driveId: id, studentId: student.id, status: "applied" } });
    await logAudit(req, "apply", "drive", id);
    return reply.code(201).send(application);
  });
}
