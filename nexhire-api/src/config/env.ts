import { z } from "zod";
import { config } from "dotenv";
config();

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  REDIS_URL: z.string().default(""),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().default("nexhire-resumes"),
  ENGINE_GRPC_URL: z.string().default("http://localhost:50051"),
  AES_KEY: z.string().min(32).optional(),
});

export type Env = z.infer<typeof envSchema>;
let env: Env;
try { env = envSchema.parse(process.env); } catch (err) {
  if (err instanceof z.ZodError) { console.error("❌ Invalid env vars:", JSON.stringify(err.format(), null, 2)); process.exit(1); }
  throw err;
}
export { env };
