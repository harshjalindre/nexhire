import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { AppError, NotFoundError, ConflictError, UnauthorizedError } from "../../utils/errors.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";

export async function loginUser(input: LoginInput) {
  const tenant = await prisma.tenant.findUnique({ where: { code: input.collegeCode } });
  if (!tenant) throw new NotFoundError("College");
  const user = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: input.email } } });
  if (!user) throw new UnauthorizedError("Invalid credentials");
  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new UnauthorizedError("Invalid credentials");
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId }, tenant: { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo } };
}

export async function signupUser(input: SignupInput) {
  const tenant = await prisma.tenant.findUnique({ where: { code: input.collegeCode } });
  if (!tenant) throw new NotFoundError("College");
  const existing = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email: input.email } } });
  if (existing) throw new ConflictError("Email already registered for this college");
  const hashedPassword = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({ data: { tenantId: tenant.id, name: input.name, email: input.email, password: hashedPassword, role: input.role } });
  if (input.role === "student") { await prisma.student.create({ data: { userId: user.id, tenantId: tenant.id, branch: "", year: 1, cgpa: 0, backlogs: 0, profileCompletion: 10 } }); }
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId }, tenant: { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo } };
}
