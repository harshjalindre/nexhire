import type { FastifyInstance } from "fastify";
import { prisma } from "../../config/prisma.js";

export async function analyticsRoutes(fastify: FastifyInstance) {
  // College Admin analytics
  fastify.get("/dashboard", async (req, reply) => {
    const tenantId = req.tenantId;
    const [totalStudents, totalCompanies, totalDrives, totalApplications, placedStudents, activeDrives, recentDrives, topCompanies, branchStats] = await Promise.all([
      prisma.student.count({ where: { tenantId } }),
      prisma.company.count({ where: { tenantId } }),
      prisma.drive.count({ where: { tenantId } }),
      prisma.application.count({ where: { drive: { tenantId } } }),
      prisma.student.count({ where: { tenantId, placementStatus: "placed" } }),
      prisma.drive.count({ where: { tenantId, status: "active" } }),
      prisma.drive.findMany({ where: { tenantId }, include: { company: true, _count: { select: { applications: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.company.findMany({ where: { tenantId }, include: { _count: { select: { drives: true } } }, orderBy: { drives: { _count: "desc" } }, take: 5 }),
      prisma.student.groupBy({ by: ["branch"], where: { tenantId }, _count: true }),
    ]);
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
    return reply.send({
      stats: { totalStudents, totalCompanies, totalDrives, totalApplications, placedStudents, activeDrives, placementRate },
      recentDrives: recentDrives.map(d => ({ id: d.id, title: d.title, companyName: d.company.name, status: d.status, applicationsCount: d._count.applications, createdAt: d.createdAt.toISOString() })),
      topCompanies: topCompanies.map(c => ({ id: c.id, name: c.name, industry: c.industry, drivesCount: c._count.drives })),
      branchDistribution: branchStats.map(b => ({ branch: b.branch || "Unknown", count: b._count })),
    });
  });

  // Super Admin analytics
  fastify.get("/admin", async (req, reply) => {
    if (req.currentUser.role !== "super_admin") return reply.code(403).send({ message: "Forbidden" });
    const [totalTenants, totalUsers, totalStudents, totalDrives, totalApplications, tenantStats] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.student.count(),
      prisma.drive.count(),
      prisma.application.count(),
      prisma.tenant.findMany({ include: { _count: { select: { users: true, students: true, drives: true } } }, orderBy: { createdAt: "desc" } }),
    ]);
    return reply.send({
      stats: { totalTenants, totalUsers, totalStudents, totalDrives, totalApplications },
      tenants: tenantStats.map(t => ({ id: t.id, name: t.name, code: t.code, tier: t.tier, status: t.status, usersCount: t._count.users, studentsCount: t._count.students, drivesCount: t._count.drives })),
    });
  });

  // Student analytics
  fastify.get("/student", async (req, reply) => {
    const userId = req.currentUser.id;
    const student = await prisma.student.findUnique({ where: { userId }, include: { applications: { include: { drive: { include: { company: true } } }, orderBy: { appliedAt: "desc" } } } });
    if (!student) return reply.code(404).send({ message: "Student not found" });
    const totalApplied = student.applications.length;
    const shortlisted = student.applications.filter(a => a.status === "shortlisted").length;
    const selected = student.applications.filter(a => a.status === "selected").length;
    const pending = student.applications.filter(a => a.status === "applied").length;
    return reply.send({
      stats: { totalApplied, shortlisted, selected, pending, profileCompletion: student.profileCompletion, placementStatus: student.placementStatus },
      recentApplications: student.applications.slice(0, 5).map(a => ({ id: a.id, driveTitle: a.drive.title, companyName: a.drive.company.name, status: a.status, packageLpa: a.drive.packageLpa, appliedAt: a.appliedAt.toISOString() })),
    });
  });

  // CSV export
  fastify.get("/export/students", async (req, reply) => {
    const tenantId = req.tenantId;
    const students = await prisma.student.findMany({ where: { tenantId }, include: { user: true } });
    const header = "Name,Email,Branch,Year,CGPA,Backlogs,Placement Status,Profile Completion\n";
    const rows = students.map(s => `"${s.user.name}","${s.user.email}","${s.branch}",${s.year},${s.cgpa},${s.backlogs},"${s.placementStatus}",${s.profileCompletion}`).join("\n");
    reply.header("Content-Type", "text/csv");
    reply.header("Content-Disposition", "attachment; filename=students-export.csv");
    return reply.send(header + rows);
  });

  fastify.get("/export/drives", async (req, reply) => {
    const tenantId = req.tenantId;
    const drives = await prisma.drive.findMany({ where: { tenantId }, include: { company: true, _count: { select: { applications: true } } } });
    const header = "Title,Company,Package (LPA),Min CGPA,Status,Applications,Start Date,End Date\n";
    const rows = drives.map(d => `"${d.title}","${d.company.name}",${d.packageLpa},${d.minCgpa},"${d.status}",${d._count.applications},"${d.startDate.toISOString().slice(0, 10)}","${d.endDate.toISOString().slice(0, 10)}"`).join("\n");
    reply.header("Content-Type", "text/csv");
    reply.header("Content-Disposition", "attachment; filename=drives-export.csv");
    return reply.send(header + rows);
  });
}
