import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" { interface FastifyRequest { tenantId: string; } }

async function tenantPlugin(fastify: FastifyInstance) {
  fastify.decorate("tenantGuard", async function (req: FastifyRequest, reply: FastifyReply) {
    const tenantId = req.currentUser?.tenantId || req.headers["x-tenant-id"] as string;
    if (!tenantId) return reply.code(400).send({ message: "Tenant context required" });
    req.tenantId = tenantId;
  });
}
export default fp(tenantPlugin, { name: "tenant", dependencies: ["auth"] });
