import { env } from "./env.js";
import { logger } from "./logger.js";

export const CACHE_TTL = { SHORT: 60, MEDIUM: 300, LONG: 3600, DAY: 86400 } as const;

let redis: import("ioredis").default | null = null;

export async function connectRedis() {
  if (!env.REDIS_URL) {
    logger.info("⏭️  Redis disabled (no REDIS_URL)");
    return;
  }
  try {
    const Redis = (await import("ioredis")).default;
    redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 3, retryStrategy: (times) => { if (times > 3) return null; return Math.min(times * 50, 2000); }, lazyConnect: true });
    redis.on("error", () => {});
    await redis.connect();
    logger.info("✅ Redis connected");
  } catch {
    logger.warn("⚠️  Redis not available — running without cache");
    redis = null;
  }
}

export { redis };
