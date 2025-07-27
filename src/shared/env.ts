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
  REDIS_URL: z.string(),
  REDIS_PREFIX: z.string().default(""),
  PAYMENT_PROCESSOR_URL_DEFAULT: z.string(),
  PAYMENT_PROCESSOR_URL_FALLBACK: z.string(),
  PAYMENT_PROCESSOR_RETRY_LIMIT_BEFORE_USE_FALLBACK: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("4"),
});

export const env = envSchema.parse(process.env);