import { prisma } from "../../config/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { CreateDriveInput, UpdateDriveInput } from "./drives.schema.js";
import { v4 as uuid } from "uuid";

export async function getDrives(tenantId: string, filters: { status?: string; branch?: string; search?: string; skip: number; limit: number }) {
  const where: Record<string, unknown> = { tenantId };
  if (filters.status) where.status = filters.status;
  if (filters.search) where.OR = [{ title: { contains: filters.search, mode: "insensitive" } }, { company: { name: { contains: filters.search, mode: "insensitive" } } }];
  const [data, total] = await Promise.all([prisma.drive.findMany({ where, include: { company: { select: { name: true, logo: true } }, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" }, skip: filters.skip, take: filters.limit }), prisma.drive.count({ where })]);
  return { data: data.map((d) => ({ ...d, companyName: d.company.name, companyLogo: d.company.logo, applicationsCount: d._count.applications })), total };
}

export async function getDrive(id: string, tenantId: string) {
  const drive = await prisma.drive.findFirst({ where: { id, tenantId }, include: { company: true, _count: { select: { applications: true } } } });
  if (!drive) throw new NotFoundError("Drive");
  return { ...drive, companyName: drive.company.name, applicationsCount: drive._count.applications };
}

export async function createDrive(tenantId: string, input: CreateDriveInput) {
  const rounds = (input.rounds || []).map((r) => ({ ...r, id: uuid() }));
  return prisma.drive.create({ data: { tenantId, companyId: input.companyId, title: input.title, description: input.description, branches: input.branches, minCgpa: input.minCgpa, maxBacklogs: input.maxBacklogs, packageLpa: input.packageLpa, startDate: new Date(input.startDate), endDate: new Date(input.endDate), rounds, status: input.status } });
}

export async function updateDrive(id: string, tenantId: string, input: UpdateDriveInput) {
  const existing = await prisma.drive.findFirst({ where: { id, tenantId } });
  if (!existing) throw new NotFoundError("Drive");
  return prisma.drive.update({ where: { id }, data: { ...input, startDate: input.startDate ? new Date(input.startDate) : undefined, endDate: input.endDate ? new Date(input.endDate) : undefined } });
}

export async function deleteDrive(id: string, tenantId: string) {
  const existing = await prisma.drive.findFirst({ where: { id, tenantId } });
  if (!existing) throw new NotFoundError("Drive");
  await prisma.drive.delete({ where: { id } });
}
