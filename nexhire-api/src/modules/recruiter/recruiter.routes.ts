import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";
import { getPagination } from "../../utils/pagination.js";

export async function recruiterRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRequest", fastify.authenticate);
  fastify.addHook("onRequest", fastify.tenantGuard);

  // Recruiter dashboard stats
  fastify.get("/dashboard", async (req, reply) => {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });

    const where = recruiter.companyId
      ? { createdById: recruiter.id }
      : { tenantId: req.tenantId };

    const [totalDrives, activeDrives, totalApplications, shortlisted, selected, rejected] = await Promise.all([
      prisma.drive.count({ where }),
      prisma.drive.count({ where: { ...where, status: "active" } }),
      prisma.application.count({ where: { drive: where } }),
      prisma.application.count({ where: { drive: where, status: "shortlisted" } }),
      prisma.application.count({ where: { drive: where, status: "selected" } }),
      prisma.application.count({ where: { drive: where, status: "rejected" } }),
    ]);

    const recentDrives = await prisma.drive.findMany({
      where, orderBy: { createdAt: "desc" }, take: 5,
      include: { company: { select: { name: true } }, _count: { select: { applications: true } } },
    });

    const pipeline = await prisma.application.groupBy({
      by: ["status"], where: { drive: where }, _count: true,
    });

    return reply.send({
      stats: { totalDrives, activeDrives, totalApplications, shortlisted, selected, rejected, conversionRate: totalApplications > 0 ? Math.round((selected / totalApplications) * 100) : 0 },
      recentDrives: recentDrives.map(d => ({ id: d.id, title: d.title, companyName: d.company.name, status: d.status, applicationsCount: d._count.applications })),
      pipeline: pipeline.map(p => ({ status: p.status, count: p._count })),
    });
  });

  // Recruiter's drives
  fastify.get("/drives", async (req, reply) => {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });
    const { page, limit, skip } = getPagination(req);
    const query = req.query as Record<string, string>;

    const where: Record<string, unknown> = { createdById: recruiter.id };
    if (query.status && query.status !== "all") where.status = query.status;
    if (query.search) where.title = { contains: query.search, mode: "insensitive" };

    const [drives, total] = await Promise.all([
      prisma.drive.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { company: { select: { name: true, industry: true } }, _count: { select: { applications: true } } } }),
      prisma.drive.count({ where }),
    ]);

    return reply.send({
      data: drives.map(d => ({ ...d, companyName: d.company.name, companyIndustry: d.company.industry, applicationsCount: d._count.applications })),
      total, page, totalPages: Math.ceil(total / limit),
    });
  });

  // Create drive as recruiter
  fastify.post("/drives", async (req, reply) => {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });
    if (!recruiter.companyId) return reply.code(400).send({ message: "No company assigned to your profile" });

    const input = req.body as Record<string, unknown>;
    const drive = await prisma.drive.create({
      data: {
        tenantId: req.tenantId, companyId: recruiter.companyId, createdById: recruiter.id,
        title: (input.title as string).slice(0, 200), description: (input.description as string || "").slice(0, 2000),
        branches: input.branches || [], minCgpa: Number(input.minCgpa) || 0, maxBacklogs: Number(input.maxBacklogs) || 0,
        packageLpa: Number(input.packageLpa) || 0, startDate: new Date(input.startDate as string),
        endDate: new Date(input.endDate as string), rounds: input.rounds || [], status: (input.status as string) || "draft",
      },
    });
    return reply.code(201).send(drive);
  });

  // Get applicants for a drive
  fastify.get("/drives/:driveId/applicants", async (req, reply) => {
    const { driveId } = req.params as { driveId: string };
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });

    const drive = await prisma.drive.findUnique({ where: { id: driveId } });
    if (!drive || drive.createdById !== recruiter.id) return reply.code(403).send({ message: "Not your drive" });

    const { page, limit, skip } = getPagination(req);
    const query = req.query as Record<string, string>;
    const where: Record<string, unknown> = { driveId };
    if (query.status && query.status !== "all") where.status = query.status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where, skip, take: limit, orderBy: { appliedAt: "desc" },
        include: { student: { include: { user: { select: { name: true, email: true, avatar: true } } } } },
      }),
      prisma.application.count({ where }),
    ]);

    return reply.send({
      drive: { id: drive.id, title: drive.title, status: drive.status },
      data: applications.map(a => ({
        id: a.id, status: a.status, appliedAt: a.appliedAt,
        student: { id: a.student.id, name: a.student.user.name, email: a.student.user.email, avatar: a.student.user.avatar, branch: a.student.branch, cgpa: a.student.cgpa, backlogs: a.student.backlogs, skills: a.student.skills, resumeUrl: a.student.resumeUrl, year: a.student.year },
      })),
      total, page, totalPages: Math.ceil(total / limit),
    });
  });

  // Update application status (shortlist / select / reject)
  fastify.patch("/applications/:applicationId", async (req, reply) => {
    const { applicationId } = req.params as { applicationId: string };
    const { status } = req.body as { status: string };
    if (!["shortlisted", "selected", "rejected"].includes(status)) return reply.code(400).send({ message: "Invalid status. Use: shortlisted, selected, rejected" });

    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });

    const application = await prisma.application.findUnique({ where: { id: applicationId }, include: { drive: true } });
    if (!application || application.drive.createdById !== recruiter.id) return reply.code(403).send({ message: "Not authorized" });

    const updated = await prisma.application.update({ where: { id: applicationId }, data: { status } });

    // Update student placement status if selected
    if (status === "selected") {
      await prisma.student.update({ where: { id: application.studentId }, data: { placementStatus: "placed" } });
    }

    return reply.send(updated);
  });

  // Bulk update application statuses
  fastify.patch("/applications/bulk", async (req, reply) => {
    const { applicationIds, status } = req.body as { applicationIds: string[]; status: string };
    if (!["shortlisted", "selected", "rejected"].includes(status)) return reply.code(400).send({ message: "Invalid status" });
    if (!applicationIds?.length) return reply.code(400).send({ message: "No applications specified" });

    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });

    const result = await prisma.$transaction(async (tx) => {
      const apps = await tx.application.findMany({ where: { id: { in: applicationIds } }, include: { drive: true } });
      const authorized = apps.filter(a => a.drive.createdById === recruiter.id);
      await tx.application.updateMany({ where: { id: { in: authorized.map(a => a.id) } }, data: { status } });
      if (status === "selected") { await tx.student.updateMany({ where: { id: { in: authorized.map(a => a.studentId) } }, data: { placementStatus: "placed" } }); }
      return { updated: authorized.length, total: applicationIds.length };
    });

    return reply.send(result);
  });

  // Recruiter profile
  fastify.get("/profile", async (req, reply) => {
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: req.currentUser.id }, include: { user: { select: { name: true, email: true, avatar: true } }, company: { select: { id: true, name: true, industry: true } } } });
    if (!recruiter) return reply.code(404).send({ message: "Recruiter profile not found" });
    return reply.send(recruiter);
  });
}
