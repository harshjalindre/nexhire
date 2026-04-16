import { PrismaClient } from "@prisma/client";
import { logger } from "./logger.js";

export const prisma = new PrismaClient({ log: [{ level: "query", emit: "event" }, { level: "error", emit: "event" }, { level: "warn", emit: "event" }] });
prisma.$on("query", (e) => { logger.debug({ query: e.query, duration: e.duration }, "DB Query"); });
prisma.$on("error", (e) => { logger.error({ message: e.message }, "DB Error"); });

export async function connectDB() { try { await prisma.$connect(); logger.info("✅ Database connected"); } catch (err) { logger.error(err, "❌ Database connection failed"); process.exit(1); } }
export async function disconnectDB() { await prisma.$disconnect(); logger.info("Database disconnected"); }
