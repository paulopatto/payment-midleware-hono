import { env } from "./env";
import IORedis from "ioredis";

export const redis = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });