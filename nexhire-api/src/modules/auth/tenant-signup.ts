import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { ConflictError } from "../../utils/errors.js";
import { sendEmail, emailTemplates } from "../../config/email.js";

export interface TenantSignupInput {
  collegeName: string;
  collegeCode: string;
  adminName: string;
  adminEmail: string;
  password: string;
}

export async function registerTenant(input: TenantSignupInput) {
  const existing = await prisma.tenant.findUnique({ where: { code: input.collegeCode } });
  if (existing) throw new ConflictError("College code already taken");

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const tenant = await prisma.tenant.create({
    data: {
      name: input.collegeName,
      code: input.collegeCode,
      tier: "basic",
      status: "active",
    },
  });

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: input.adminName,
      email: input.adminEmail,
      password: hashedPassword,
      role: "college_admin",
    },
  });

  // Create default subscription
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await prisma.subscription.create({
    data: { tenantId: tenant.id, planId: "basic", status: "active", currentPeriodStart: now, currentPeriodEnd: periodEnd },
  });

  // Send welcome email
  const tmpl = emailTemplates.welcome(input.adminName, input.collegeCode);
  sendEmail(input.adminEmail, tmpl.subject, tmpl.html).catch(() => {});

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId },
    tenant: { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo },
  };
}
