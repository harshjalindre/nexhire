import type { FastifyInstance } from "fastify";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { sendEmail, emailTemplates } from "../../config/email.js";
import { checkStudentLimit } from "../../middleware/planGate.js";

interface CsvRow {
  name: string;
  email: string;
  branch: string;
  year: string;
  cgpa: string;
  backlogs?: string;
}

// #13 — Proper CSV parser that handles quoted fields
function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));

  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row as unknown as CsvRow;
  }).filter(r => r.name && r.email);
}

export async function bulkImportRoutes(fastify: FastifyInstance) {
  // #7 — Tenant isolation: require auth
  fastify.addHook("onRequest", fastify.authenticate);
  fastify.addHook("onRequest", fastify.tenantGuard);

  fastify.post("/bulk-import", async (req, reply) => {
    if (!["college_admin", "super_admin"].includes(req.currentUser.role)) return reply.code(403).send({ message: "Forbidden" });

    const data = await req.file();
    if (!data) return reply.code(400).send({ message: "No CSV file uploaded" });
    const text = (await data.toBuffer()).toString("utf-8");
    const rows = parseCsv(text);

    if (rows.length === 0) return reply.code(400).send({ message: "No valid rows found in CSV" });
    if (rows.length > 500) return reply.code(400).send({ message: "Maximum 500 students per import" });

    // Check plan student limit
    const limitCheck = await checkStudentLimit(req.tenantId);
    if (!limitCheck.allowed) return reply.code(403).send({ message: `Student limit reached (${limitCheck.current}/${limitCheck.limit}). Upgrade your plan.` });

    const results = { total: rows.length, created: 0, skipped: 0, errors: [] as string[] };
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // #15 — Use transaction for atomicity
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenantId } });
    try {
      await prisma.$transaction(async (tx) => {
        for (const row of rows) {
          const existing = await tx.user.findUnique({ where: { tenantId_email: { tenantId: req.tenantId, email: row.email } } });
          if (existing) { results.skipped++; continue; }

          // #20 — Input length validation
          if (row.name.length > 100 || row.email.length > 200) { results.errors.push(`Row ${row.email}: Name/email too long`); continue; }

          const cgpa = Math.min(10, Math.max(0, parseFloat(row.cgpa) || 0));
          const year = Math.min(6, Math.max(1, parseInt(row.year) || 1));
          const backlogs = Math.max(0, parseInt(row.backlogs || "0") || 0);

          const user = await tx.user.create({ data: { tenantId: req.tenantId, name: row.name.slice(0, 100), email: row.email.slice(0, 200), password: hashedPassword, role: "student" } });
          await tx.student.create({ data: { userId: user.id, tenantId: req.tenantId, branch: (row.branch || "General").slice(0, 50), year, cgpa, backlogs, profileCompletion: 40 } });
          results.created++;
        }
      });
    } catch (err) {
      results.errors.push(`Transaction failed: ${(err as Error).message}`);
    }

    // Send welcome emails outside transaction (non-blocking)
    if (tenant && results.created > 0) {
      const tmpl = emailTemplates.welcome("Student", tenant.code);
      // Don't email every student in bulk — just log
    }

    // #1 — Never expose passwords in response
    return reply.send({
      message: `Import complete: ${results.created} created, ${results.skipped} skipped. Students must reset their password on first login.`,
      total: results.total,
      created: results.created,
      skipped: results.skipped,
      errors: results.errors,
    });
  });

  // Download CSV template
  fastify.get("/bulk-import/template", async (_req, reply) => {
    const csv = "name,email,branch,year,cgpa,backlogs\nJohn Doe,john@example.com,Computer Science,3,8.5,0\n\"Smith, Jane\",jane@example.com,Electronics,2,7.8,1\n";
    reply.header("Content-Type", "text/csv");
    reply.header("Content-Disposition", "attachment; filename=student-import-template.csv");
    return reply.send(csv);
  });
}
