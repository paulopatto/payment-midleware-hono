import { redis } from "../shared/redis";

export async function savePaymentToRedis(id: string, payload: any) {
  await redis.set(id, JSON.stringify(payload));
}

export async function getPaymentFromRedis(id: string) {
  const data = await redis.get(id);
  return data ? JSON.parse(data) : null;
}