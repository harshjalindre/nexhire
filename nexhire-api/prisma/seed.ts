import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  const tenant = await prisma.tenant.upsert({ where: { code: "MIT2024" }, update: {}, create: { name: "MIT Pune", code: "MIT2024", tier: "premium", status: "active" } });
  const password = await bcrypt.hash("password123", 12);
  const systemTenant = await prisma.tenant.upsert({ where: { code: "SYSTEM" }, update: {}, create: { name: "NexHire System", code: "SYSTEM", tier: "enterprise", status: "active" } });
  await prisma.user.upsert({ where: { tenantId_email: { tenantId: systemTenant.id, email: "admin@nexhire.com" } }, update: {}, create: { tenantId: systemTenant.id, name: "Super Admin", email: "admin@nexhire.com", password, role: "super_admin" } });
  await prisma.user.upsert({ where: { tenantId_email: { tenantId: tenant.id, email: "admin@mitpune.edu" } }, update: {}, create: { tenantId: tenant.id, name: "Dr. Priya Mehta", email: "admin@mitpune.edu", password, role: "college_admin" } });
  const google = await prisma.company.create({ data: { tenantId: tenant.id, name: "Google", industry: "Technology", website: "https://google.com", contactName: "Sundar P.", contactEmail: "recruit@google.com" } });
  const microsoft = await prisma.company.create({ data: { tenantId: tenant.id, name: "Microsoft", industry: "Technology", website: "https://microsoft.com", contactName: "Satya N.", contactEmail: "recruit@microsoft.com" } });
  const students = [
    { name: "Rahul Kumar", email: "rahul@mitpune.edu", branch: "Computer Science", cgpa: 8.5, skills: ["React", "Node.js", "Python"] },
    { name: "Priya Sharma", email: "priya@mitpune.edu", branch: "Computer Science", cgpa: 9.1, skills: ["TypeScript", "Go", "Docker"] },
    { name: "Ananya Patel", email: "ananya@mitpune.edu", branch: "Information Technology", cgpa: 7.8, skills: ["Java", "Spring", "MySQL"] },
    { name: "Vikram Singh", email: "vikram@mitpune.edu", branch: "Electronics", cgpa: 8.2, skills: ["C++", "Embedded", "IoT"] },
    { name: "Sneha Reddy", email: "sneha@mitpune.edu", branch: "Computer Science", cgpa: 9.4, skills: ["ML", "Python", "TensorFlow"] },
  ];
  for (const s of students) {
    const user = await prisma.user.upsert({ where: { tenantId_email: { tenantId: tenant.id, email: s.email } }, update: {}, create: { tenantId: tenant.id, name: s.name, email: s.email, password, role: "student" } });
    await prisma.student.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, tenantId: tenant.id, branch: s.branch, year: 3, cgpa: s.cgpa, backlogs: 0, skills: s.skills, profileCompletion: 75 } });
  }
  // Recruiter user + profile
  const recruiterUser = await prisma.user.upsert({ where: { tenantId_email: { tenantId: tenant.id, email: "recruiter@google.com" } }, update: {}, create: { tenantId: tenant.id, name: "Recruiter Gupta", email: "recruiter@google.com", password, role: "recruiter" } });
  const recruiter = await prisma.recruiter.upsert({ where: { userId: recruiterUser.id }, update: {}, create: { userId: recruiterUser.id, tenantId: tenant.id, companyId: google.id, designation: "HR Manager", phone: "+91 98765 43210" } });

  // Drives created by recruiter
  const drive1 = await prisma.drive.create({ data: { tenantId: tenant.id, companyId: google.id, createdById: recruiter.id, title: "SDE Intern 2026", description: "Google SDE Internship for Summer 2026.", branches: ["Computer Science", "Information Technology"], minCgpa: 8.0, maxBacklogs: 0, packageLpa: 25, startDate: new Date("2026-04-15"), endDate: new Date("2026-05-15"), rounds: [{ id: "r1", name: "Online Assessment", type: "coding" }, { id: "r2", name: "Technical Round", type: "technical" }, { id: "r3", name: "HR Round", type: "hr" }], status: "active" } });
  await prisma.drive.create({ data: { tenantId: tenant.id, companyId: microsoft.id, title: "PM Intern 2026", description: "Microsoft PM Internship.", branches: ["Computer Science", "IT", "Electronics"], minCgpa: 7.5, maxBacklogs: 1, packageLpa: 22, startDate: new Date("2026-04-20"), endDate: new Date("2026-05-20"), rounds: [{ id: "r1", name: "Case Study", type: "aptitude" }, { id: "r2", name: "PM Interview", type: "technical" }], status: "active" } });

  // Sample applications for recruiter to review
  for (const s of students) {
    const studentUser = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: s.email } } });
    if (studentUser) {
      const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });
      if (student) {
        await prisma.application.create({ data: { driveId: drive1.id, studentId: student.id, status: "applied" } }).catch(() => {});
      }
    }
  }

  console.log("✅ Seeding complete!");
  console.log("📧 Logins:");
  console.log("   Super Admin: admin@nexhire.com / SYSTEM / password123");
  console.log("   College Admin: admin@mitpune.edu / MIT2024 / password123");
  console.log("   Student: rahul@mitpune.edu / MIT2024 / password123");
  console.log("   Recruiter: recruiter@google.com / MIT2024 / password123");
}
main().catch(console.error).finally(() => prisma.$disconnect());
