import { z } from "zod";
import dotenv from "dotenv";

let envFile = ".env";

if (process.env.NODE_ENV === "test") envFile = ".env.test";
if (process.env.NODE_ENV === "ci") envFile = ".env.ci";

dotenv.config({
  path: envFile
});

const envSchema = z.object({
  PORT: z.string().default("8080"),
  NODE_ENV: z.enum(["development", "production", "test", "ci"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  REDIS_URL: z.string(),
  REDIS_PREFIX: z.string().default(""),
  PAYMENT_PROCESSOR_URL_DEFAULT: z.string(),
  PAYMENT_PROCESSOR_URL_FALLBACK: z.string(),
  PAYMENT_PROCESSOR_RETRY_LIMIT_BEFORE_USE_FALLBACK: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("4"),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default(""), // 'http://localhost:4318/v1/traces'
  PROMETHEUS_PORT: z.string().default("9464"),
});

export const env = envSchema.parse(process.env);
