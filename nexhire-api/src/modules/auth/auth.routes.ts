import type { FastifyInstance } from "fastify";
import { loginSchema, signupSchema } from "./auth.schema.js";
import { loginUser, signupUser } from "./auth.service.js";
import { AppError } from "../../utils/errors.js";

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
      return reply.code(201).send({ user: data.user, token, tenant: data.tenant });
    } catch (err) { if (err instanceof AppError) return reply.code(err.statusCode).send({ message: err.message }); throw err; }
  });
}
