import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import websocket from "@fastify/websocket";
import path from "path";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDB, disconnectDB } from "./config/prisma.js";
import { connectRedis } from "./config/redis.js";
import authPlugin from "./plugins/auth.js";
import tenantPlugin from "./plugins/tenant.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { driveRoutes } from "./modules/drives/drives.routes.js";
import { companyRoutes } from "./modules/companies/companies.routes.js";
import { studentRoutes } from "./modules/students/students.routes.js";
import { profileRoutes } from "./modules/profile/profile.routes.js";
import { applicationRoutes } from "./modules/applications/applications.routes.js";
import { tenantRoutes } from "./modules/tenants/tenants.routes.js";
import { notificationRoutes } from "./modules/notifications/notifications.routes.js";
import { analyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { billingRoutes } from "./modules/billing/billing.routes.js";
import { bulkImportRoutes } from "./modules/students/bulk-import.routes.js";
import { auditRoutes } from "./modules/audit/audit.routes.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => Promise<void>;
    authorize: (...roles: string[]) => (req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => Promise<void>;
    tenantGuard: (req: import("fastify").FastifyRequest, reply: import("fastify").FastifyReply) => Promise<void>;
  }
}

export async function buildServer() {
  const app = Fastify({ logger: false, trustProxy: true });
  await app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  // #10 — Enable CSP with sensible defaults
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:", "blob:"], connectSrc: ["'self'", "ws:", "wss:"] },
    },
  });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  // #32 — Request body size limit
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024, fieldSize: 1024 * 100 } });
  await app.register(fastifyStatic, { root: path.join(process.cwd(), "uploads"), prefix: "/uploads/", decorateReply: false });
  await app.register(websocket);
  await app.register(authPlugin);
  await app.register(tenantPlugin);

  app.setErrorHandler((error, _req, reply) => {
    logger.error(error, "Unhandled error");
    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({ message: statusCode === 500 ? "Internal server error" : error.message, statusCode });
  });

  app.get("/api/health", async () => ({ status: "ok", version: "2.0.0", timestamp: new Date().toISOString(), uptime: process.uptime() }));

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(driveRoutes, { prefix: "/api/drives" });
  await app.register(companyRoutes, { prefix: "/api/companies" });
  await app.register(studentRoutes, { prefix: "/api/students" });
  await app.register(profileRoutes, { prefix: "/api/profile" });
  await app.register(applicationRoutes, { prefix: "/api/applications" });
  await app.register(tenantRoutes, { prefix: "/api/tenants" });
  await app.register(notificationRoutes, { prefix: "/api/notifications" });
  await app.register(analyticsRoutes, { prefix: "/api/analytics" });
  await app.register(billingRoutes, { prefix: "/api/billing" });
  await app.register(bulkImportRoutes, { prefix: "/api/students" });
  await app.register(auditRoutes, { prefix: "/api/audit-logs" });

  // #4 — WebSocket with JWT auth
  app.register(async function wsRoutes(fastify) {
    fastify.get("/ws/notifications", { websocket: true }, (socket, req) => {
      const token = (req.query as Record<string, string>).token;
      if (!token) { socket.send(JSON.stringify({ type: "error", message: "Missing token" })); socket.close(); return; }
      try { fastify.jwt.verify(token); } catch { socket.send(JSON.stringify({ type: "error", message: "Invalid token" })); socket.close(); return; }
      socket.on("message", (msg) => logger.debug({ msg: msg.toString() }, "WS message"));
      socket.send(JSON.stringify({ type: "connected", message: "Welcome to NexHire real-time" }));
    });
  });

  return app;
}

async function main() {
  try { await connectDB(); await connectRedis(); const app = await buildServer(); await app.listen({ port: env.PORT, host: env.HOST }); logger.info(`🚀 NexHire API running on http://${env.HOST}:${env.PORT}`); }
  catch (err) { logger.error(err, "Failed to start server"); process.exit(1); }
}

for (const signal of ["SIGINT", "SIGTERM"]) { process.on(signal, async () => { logger.info(`${signal} received`); await disconnectDB(); process.exit(0); }); }
main();
