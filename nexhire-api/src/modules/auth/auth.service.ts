import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/prisma.js";
import { AppError, NotFoundError, ConflictError, UnauthorizedError } from "../../utils/errors.js";
import { sendEmail, emailTemplates } from "../../config/email.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

export async function loginUser(input: LoginInput) {
  const tenant = await prisma.tenant.findUnique({ where: { code: input.collegeCode } });
  if (!tenant) throw new NotFoundError("College");
  const user = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: input.email } } });
  if (!user) throw new UnauthorizedError("Invalid credentials");

  // Account lockout check
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new UnauthorizedError(`Account locked. Try again in ${mins} minutes.`);
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    const failedLogins = user.failedLogins + 1;
    const updates: Record<string, unknown> = { failedLogins };
    if (failedLogins >= MAX_FAILED_LOGINS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      updates.failedLogins = 0;
    }
    await prisma.user.update({ where: { id: user.id }, data: updates });
    throw new UnauthorizedError(failedLogins >= MAX_FAILED_LOGINS ? `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` : "Invalid credentials");
  }

  // Reset failed login count on success
  if (user.failedLogins > 0) await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });

  // Generate refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, emailVerified: user.emailVerified }, tenant: { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo }, refreshToken };
}

export async function signupUser(input: SignupInput) {
  const tenant = await prisma.tenant.findUnique({ where: { code: input.collegeCode } });
  if (!tenant) throw new NotFoundError("College");
  const existing = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: input.email } } });
  if (existing) throw new ConflictError("Email already registered for this college");
  const hashedPassword = await bcrypt.hash(input.password, 12);
  const verifyToken = crypto.randomInt(100000, 999999).toString();
  const user = await prisma.user.create({ data: { tenantId: tenant.id, name: input.name, email: input.email, password: hashedPassword, role: input.role, verifyToken } });
  if (input.role === "student") { await prisma.student.create({ data: { userId: user.id, tenantId: tenant.id, branch: "", year: 1, cgpa: 0, backlogs: 0, profileCompletion: 10 } }); }
  // Send welcome + verification email
  const tmpl = emailTemplates.welcome(input.name, input.collegeCode);
  sendEmail(input.email, tmpl.subject, tmpl.html).catch(() => {});
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, emailVerified: false }, tenant: { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo } };
}

export async function verifyEmail(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User");
  if (user.emailVerified) return { message: "Email already verified" };
  if (user.verifyToken !== token) throw new UnauthorizedError("Invalid verification code");
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: true, verifyToken: null } });
  return { message: "Email verified successfully" };
}

export async function refreshAccessToken(refreshTokenInput: string) {
  const user = await prisma.user.findFirst({ where: { refreshToken: refreshTokenInput } });
  if (!user) throw new UnauthorizedError("Invalid refresh token");
  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  // Rotate refresh token
  const newRefreshToken = crypto.randomBytes(40).toString("hex");
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, emailVerified: user.emailVerified }, tenant: tenant ? { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo } : null, refreshToken: newRefreshToken };
}

export async function forgotPassword(email: string, collegeCode: string) {
  const tenant = await prisma.tenant.findUnique({ where: { code: collegeCode } });
  if (!tenant) throw new NotFoundError("College");
  const user = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email } } });
  if (!user) return { message: "If the email exists, a reset code has been sent." };
  const resetToken = crypto.randomInt(100000, 999999).toString();
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
  const tmpl = emailTemplates.passwordReset(user.name, resetToken);
  await sendEmail(email, tmpl.subject, tmpl.html);
  return { message: "If the email exists, a reset code has been sent." };
}

export async function resetPassword(email: string, collegeCode: string, token: string, newPassword: string) {
  const tenant = await prisma.tenant.findUnique({ where: { code: collegeCode } });
  if (!tenant) throw new NotFoundError("College");
  const user = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email } } });
  if (!user || user.resetToken !== token) throw new UnauthorizedError("Invalid or expired reset code");
  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) throw new UnauthorizedError("Reset code has expired");
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null } });
  return { message: "Password reset successfully" };
}
