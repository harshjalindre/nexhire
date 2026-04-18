import type { FastifyInstance } from "fastify";
import { loginSchema, signupSchema } from "./auth.schema.js";
import { loginUser, signupUser, forgotPassword, resetPassword, verifyEmail, refreshAccessToken } from "./auth.service.js";
import { registerTenant } from "./tenant-signup.js";
import { AppError } from "../../utils/errors.js";
import { prisma } from "../../config/prisma.js";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/login", async (req, reply) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    try {
      const data = await loginUser(result.data);
      const token = fastify.jwt.sign({ id: data.user.id, tenantId: data.user.tenantId, email: data.user.email, role: data.user.role });
      return reply.send({ user: data.user, token, tenant: data.tenant });
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/signup", async (req, reply) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) return reply.code(422).send({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    try {
      const data = await signupUser(result.data);
      const token = fastify.jwt.sign({ id: data.user.id, tenantId: data.user.tenantId, email: data.user.email, role: data.user.role });
      return reply.send({ user: data.user, token, tenant: data.tenant, refreshToken: data.refreshToken });
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/verify-email", async (req, reply) => {
    const { userId, token } = req.body as { userId: string; token: string };
    if (!userId || !token) return reply.code(400).send({ message: "userId and token required" });
    try {
      const data = await verifyEmail(userId, token);
      return reply.send(data);
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/refresh-token", async (req, reply) => {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) return reply.code(400).send({ message: "refreshToken required" });
    try {
      const data = await refreshAccessToken(refreshToken);
      const token = fastify.jwt.sign({ id: data.user.id, tenantId: data.user.tenantId, email: data.user.email, role: data.user.role });
      return reply.code(201).send({ user: data.user, token, tenant: data.tenant, refreshToken: data.refreshToken });
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/forgot-password", async (req, reply) => {
    const { email, collegeCode } = req.body as { email: string; collegeCode: string };
    if (!email || !collegeCode) return reply.code(400).send({ message: "Email and college code required" });
    try {
      const data = await forgotPassword(email, collegeCode);
      return reply.send(data);
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/reset-password", async (req, reply) => {
    const { email, collegeCode, token, newPassword } = req.body as { email: string; collegeCode: string; token: string; newPassword: string };
    if (!email || !collegeCode || !token || !newPassword) return reply.code(400).send({ message: "All fields required" });
    try {
      const data = await resetPassword(email, collegeCode, token, newPassword);
      return reply.send(data);
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  fastify.post("/register-tenant", async (req, reply) => {
    const { collegeName, collegeCode, adminName, adminEmail, password } = req.body as any;
    if (!collegeName || !collegeCode || !adminName || !adminEmail || !password) return reply.code(400).send({ message: "All fields required" });
    try {
      const data = await registerTenant({ collegeName, collegeCode, adminName, adminEmail, password });
      const token = fastify.jwt.sign({ id: data.user.id, tenantId: data.user.tenantId, email: data.user.email, role: data.user.role });
      return reply.code(201).send({ user: data.user, token, tenant: data.tenant });
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });

  // Recruiter self-registration
  fastify.post("/register-recruiter", async (req, reply) => {
    const { name, email, password, collegeCode, companyName, designation, phone } = req.body as any;
    if (!name || !email || !password || !collegeCode) return reply.code(400).send({ message: "name, email, password, collegeCode required" });
    try {
      const tenant = await prisma.tenant.findUnique({ where: { code: collegeCode } });
      if (!tenant) return reply.code(404).send({ message: "College not found. Contact the placement cell for the correct code." });

      const existing = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email } } });
      if (existing) return reply.code(409).send({ message: "Email already registered" });

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash(password, 12);
      const user = await prisma.user.create({ data: { tenantId: tenant.id, name, email, password: hashedPassword, role: "recruiter" } });

      // Find or create company
      let companyId: string | null = null;
      if (companyName) {
        let company = await prisma.company.findFirst({ where: { tenantId: tenant.id, name: { equals: companyName, mode: "insensitive" } } });
        if (!company) {
          company = await prisma.company.create({ data: { tenantId: tenant.id, name: companyName, industry: "Other", contactName: name, contactEmail: email, contactPhone: phone || "" } });
        }
        companyId = company.id;
      }

      const recruiter = await prisma.recruiter.create({ data: { userId: user.id, tenantId: tenant.id, companyId, designation, phone } });

      const token = fastify.jwt.sign({ id: user.id, tenantId: user.tenantId, email: user.email, role: user.role });
      return reply.code(201).send({ user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId }, token, tenant: { id: tenant.id, name: tenant.name, code: tenant.code, logo: tenant.logo }, recruiter });
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });
}
