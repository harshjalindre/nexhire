import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import fjwt from "@fastify/jwt";
import { env } from "../config/env.js";

declare module "fastify" { interface FastifyRequest { currentUser: { id: string; tenantId: string; email: string; role: string }; } }
declare module "@fastify/jwt" { interface FastifyJWT { payload: { id: string; tenantId: string; email: string; role: string }; user: { id: string; tenantId: string; email: string; role: string }; } }

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(fjwt, { secret: env.JWT_SECRET, sign: { expiresIn: env.JWT_EXPIRES_IN } });
  fastify.decorate("authenticate", async function (req: FastifyRequest, reply: FastifyReply) { try { await req.jwtVerify(); req.currentUser = req.user; } catch { reply.code(401).send({ message: "Unauthorized", statusCode: 401 }); } });
  fastify.decorate("authorize", function (...roles: string[]) { return async function (req: FastifyRequest, reply: FastifyReply) { if (!req.currentUser) return reply.code(401).send({ message: "Unauthorized" }); if (!roles.includes(req.currentUser.role)) return reply.code(403).send({ message: "Forbidden" }); }; });
}
export default fp(authPlugin, { name: "auth" });
