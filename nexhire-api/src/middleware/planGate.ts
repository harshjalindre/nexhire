import type { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../config/prisma.js";

const PLAN_LIMITS: Record<string, { maxStudents: number; maxDrives: number; features: string[] }> = {
  basic: { maxStudents: 100, maxDrives: 5, features: ["drives", "companies", "students"] },
  premium: { maxStudents: 1000, maxDrives: -1, features: ["drives", "companies", "students", "bulk_import", "csv_export", "analytics"] },
  enterprise: { maxStudents: -1, maxDrives: -1, features: ["drives", "companies", "students", "bulk_import", "csv_export", "analytics", "api_access", "smart_match", "custom_branding"] },
};

export function requireFeature(feature: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    if (!tenant) return reply.code(404).send({ message: "Tenant not found" });
    const limits = PLAN_LIMITS[tenant.tier] || PLAN_LIMITS.basic;
    if (!limits.features.includes(feature)) {
      return reply.code(403).send({ message: `Feature "${feature}" requires a higher plan. Current: ${tenant.tier}`, requiredPlan: feature === "smart_match" ? "enterprise" : "premium", currentPlan: tenant.tier });
    }
  };
}

export async function checkStudentLimit(tenantId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const tier = tenant?.tier || "basic";
  const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.basic;
  if (limits.maxStudents === -1) return { allowed: true, current: 0, limit: -1 };
  const current = await prisma.student.count({ where: { tenantId } });
  return { allowed: current < limits.maxStudents, current, limit: limits.maxStudents };
}

export async function checkDriveLimit(tenantId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const tier = tenant?.tier || "basic";
  const limits = PLAN_LIMITS[tier] || PLAN_LIMITS.basic;
  if (limits.maxDrives === -1) return { allowed: true, current: 0, limit: -1 };
  const current = await prisma.drive.count({ where: { tenantId, status: "active" } });
  return { allowed: current < limits.maxDrives, current, limit: limits.maxDrives };
}

export async function trackUsage(tenantId: string, metric: string) {
  const month = new Date().toISOString().slice(0, 7);
  await prisma.usageLog.upsert({
    where: { tenantId_metric_month: { tenantId, metric, month } },
    update: { count: { increment: 1 } },
    create: { tenantId, metric, month, count: 1 },
  });
}

export { PLAN_LIMITS };
