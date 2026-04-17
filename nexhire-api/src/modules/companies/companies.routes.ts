import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { getPagination, paginatedResponse } from "../../utils/pagination.js";
import { logAudit } from "../../utils/audit.js";

// #20 — Input length validation
const companySchema = z.object({ name: z.string().min(2).max(100), industry: z.string().min(1).max(100), website: z.string().url().max(500).optional().or(z.literal("")), description: z.string().max(2000).optional(), contact: z.object({ name: z.string().min(2).max(100), email: z.string().email().max(200), phone: z.string().max(20).optional() }) });

export async function companyRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);
  fastify.addHook("onRequest", fastify.tenantGuard);

  fastify.get("/", async (req, reply) => {
    const query = req.query as Record<string, string>;
    const pagination = getPagination(req);
    const where: Record<string, unknown> = { tenantId: req.tenantId };
    if (query.search) where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { industry: { contains: query.search, mode: "insensitive" } }, { contactEmail: { contains: query.search, mode: "insensitive" } }];
    const [data, total] = await Promise.all([prisma.company.findMany({ where, include: { _count: { select: { drives: true } } }, orderBy: { createdAt: "desc" }, skip: pagination.skip, take: pagination.limit }), prisma.company.count({ where })]);
    const mapped = data.map((c) => ({ id: c.id, name: c.name, industry: c.industry, website: c.website, logo: c.logo, description: c.description, contact: { name: c.contactName, email: c.contactEmail, phone: c.contactPhone }, drivesCount: c._count.drives, createdAt: c.createdAt.toISOString() }));
    return reply.send(paginatedResponse(mapped, total, pagination));
  });

  fastify.post("/", async (req, reply) => {
    const result = companySchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    const company = await prisma.company.create({ data: { tenantId: req.tenantId, name: result.data.name, industry: result.data.industry, website: result.data.website || null, description: result.data.description || null, contactName: result.data.contact.name, contactEmail: result.data.contact.email, contactPhone: result.data.contact.phone || null } });
    await logAudit(req, "create", "company", company.id);
    return reply.code(201).send(company);
  });

  fastify.put("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = companySchema.partial().safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed" });
    const company = await prisma.company.updateMany({ where: { id, tenantId: req.tenantId }, data: { ...(result.data.name && { name: result.data.name }), ...(result.data.industry && { industry: result.data.industry }) } });
    await logAudit(req, "update", "company", id);
    return reply.send({ message: "Updated", count: company.count });
  });

  fastify.delete("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await prisma.company.deleteMany({ where: { id, tenantId: req.tenantId } });
    await logAudit(req, "delete", "company", id);
    return reply.code(204).send();
  });
}
