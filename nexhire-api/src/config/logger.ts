import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport: env.NODE_ENV !== "production" ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } } : undefined,
  serializers: {
    req: (req) => ({ method: req.method, url: req.url, correlationId: req.headers?.["x-correlation-id"] }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
