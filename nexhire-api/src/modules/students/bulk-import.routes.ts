import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { sendEmail, emailTemplates } from "../../config/email.js";

interface CsvRow {
  name: string;
  email: string;
  branch: string;
  year: string;
  cgpa: string;
  backlogs?: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row as unknown as CsvRow;
  }).filter(r => r.name && r.email);
}

export async function bulkImportRoutes(fastify: FastifyInstance) {
  fastify.post("/bulk-import", async (req, reply) => {
    if (!["college_admin", "super_admin"].includes(req.currentUser.role)) return reply.code(403).send({ message: "Forbidden" });

    const data = await req.file();
    if (!data) return reply.code(400).send({ message: "No CSV file uploaded" });
    const text = (await data.toBuffer()).toString("utf-8");
    const rows = parseCsv(text);

    if (rows.length === 0) return reply.code(400).send({ message: "No valid rows found in CSV" });
    if (rows.length > 500) return reply.code(400).send({ message: "Maximum 500 students per import" });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] as string[] };
    const defaultPassword = await bcrypt.hash("welcome123", 12);

    for (const row of rows) {
      try {
        const existing = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: req.tenantId, email: row.email } } });
        if (existing) { results.skipped++; continue; }

        const cgpa = parseFloat(row.cgpa) || 0;
        const year = parseInt(row.year) || 1;
        const backlogs = parseInt(row.backlogs || "0") || 0;

        const user = await prisma.user.create({ data: { tenantId: req.tenantId, name: row.name, email: row.email, password: defaultPassword, role: "student" } });
        await prisma.student.create({ data: { userId: user.id, tenantId: req.tenantId, branch: row.branch || "General", year, cgpa, backlogs, profileCompletion: 40 } });
        results.created++;

        // Send welcome email (non-blocking)
        const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
        if (tenant) {
          const tmpl = emailTemplates.welcome(row.name, tenant.code);
          sendEmail(row.email, tmpl.subject, tmpl.html).catch(() => {});
        }
      } catch (err) {
        results.errors.push(`Row ${row.email}: ${(err as Error).message}`);
      }
    }

    return reply.send({
      message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
      ...results,
      defaultPassword: "welcome123",
    });
  });

  // Download CSV template
  fastify.get("/bulk-import/template", async (_req, reply) => {
    const csv = "name,email,branch,year,cgpa,backlogs\nJohn Doe,john@example.com,Computer Science,3,8.5,0\nJane Smith,jane@example.com,Electronics,2,7.8,1\n";
    reply.header("Content-Type", "text/csv");
    reply.header("Content-Disposition", "attachment; filename=student-import-template.csv");
    return reply.send(csv);
  });
}
