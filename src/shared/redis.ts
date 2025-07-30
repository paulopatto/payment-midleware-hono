import { env } from "./env";
import IORedis from "ioredis";

export const redisPrefix = `${env.REDIS_PREFIX}`;

export const redis = new IORedis(env.REDIS_URL, { 
    maxRetriesPerRequest: null, 
    //keyPrefix: redisPrefix, // Adds prefix to all keys
});