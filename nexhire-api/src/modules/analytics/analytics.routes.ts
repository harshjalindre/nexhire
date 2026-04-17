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

  // Drive funnel analytics
  fastify.get("/drive/:driveId/funnel", async (req, reply) => {
    const { driveId } = req.params as { driveId: string };
    const drive = await prisma.drive.findUnique({ where: { id: driveId }, include: { company: true } });
    if (!drive) return reply.code(404).send({ message: "Drive not found" });
    const [totalApplicants, applied, shortlisted, selected, rejected] = await Promise.all([
      prisma.application.count({ where: { driveId } }),
      prisma.application.count({ where: { driveId, status: "applied" } }),
      prisma.application.count({ where: { driveId, status: "shortlisted" } }),
      prisma.application.count({ where: { driveId, status: "selected" } }),
      prisma.application.count({ where: { driveId, status: "rejected" } }),
    ]);
    return reply.send({
      drive: { id: drive.id, title: drive.title, companyName: drive.company.name, status: drive.status },
      funnel: [
        { stage: "Applied", count: totalApplicants, percentage: 100 },
        { stage: "Shortlisted", count: shortlisted, percentage: totalApplicants > 0 ? Math.round((shortlisted / totalApplicants) * 100) : 0 },
        { stage: "Selected", count: selected, percentage: totalApplicants > 0 ? Math.round((selected / totalApplicants) * 100) : 0 },
        { stage: "Rejected", count: rejected, percentage: totalApplicants > 0 ? Math.round((rejected / totalApplicants) * 100) : 0 },
      ],
      summary: { totalApplicants, pending: applied, conversionRate: totalApplicants > 0 ? Math.round((selected / totalApplicants) * 100) : 0 },
    });
  });

  // Placement report (HTML — can be printed to PDF via browser)
  fastify.get("/report/placement", async (req, reply) => {
    const tenantId = req.tenantId;
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const [students, drives, placed] = await Promise.all([
      prisma.student.findMany({ where: { tenantId }, include: { user: true, applications: { include: { drive: { include: { company: true } } } } } }),
      prisma.drive.findMany({ where: { tenantId }, include: { company: true, _count: { select: { applications: true } } } }),
      prisma.student.count({ where: { tenantId, placementStatus: "placed" } }),
    ]);
    const total = students.length;
    const rate = total > 0 ? Math.round((placed / total) * 100) : 0;
    const html = `<!DOCTYPE html><html><head><title>Placement Report — ${tenant?.name}</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}.header{text-align:center;border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px}.stat{display:inline-block;margin:0 20px;text-align:center}.stat-num{font-size:28px;font-weight:bold;color:#6366f1}.stat-label{font-size:12px;color:#666}@media print{body{padding:0}}</style></head><body>
      <div class="header"><h1>${tenant?.name}</h1><h2>Placement Report ${new Date().getFullYear()}</h2><p>Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div>
      <div style="text-align:center;margin:20px 0"><div class="stat"><div class="stat-num">${total}</div><div class="stat-label">Total Students</div></div><div class="stat"><div class="stat-num">${placed}</div><div class="stat-label">Placed</div></div><div class="stat"><div class="stat-num">${rate}%</div><div class="stat-label">Placement Rate</div></div><div class="stat"><div class="stat-num">${drives.length}</div><div class="stat-label">Drives</div></div></div>
      <h3>Drives Summary</h3><table><tr><th>Drive</th><th>Company</th><th>Package</th><th>Applications</th><th>Status</th></tr>${drives.map(d => `<tr><td>${d.title}</td><td>${d.company.name}</td><td>₹${d.packageLpa} LPA</td><td>${d._count.applications}</td><td>${d.status}</td></tr>`).join("")}</table>
      <h3>Student Placements</h3><table><tr><th>Name</th><th>Branch</th><th>CGPA</th><th>Status</th></tr>${students.slice(0, 50).map(s => `<tr><td>${s.user.name}</td><td>${s.branch}</td><td>${s.cgpa}</td><td>${s.placementStatus}</td></tr>`).join("")}</table>
      <p style="text-align:center;color:#999;margin-top:40px;font-size:12px">Generated by NexHire — Campus Placement Platform</p></body></html>`;
    reply.header("Content-Type", "text/html");
    return reply.send(html);
  });
}
