import { savePaymentToRedis } from "../payments/payment.repository";
import { paymentQueue } from "../shared/queue";
import { redis } from "../shared/redis";
import { paymentPostSchema, paymentSummarySchema } from "./payment.types";

export async function createPaymentHandler(c) {
  const paymentData = await c.req.json();
  const requestedAt = new Date().toISOString();
  const payload = {
    ...paymentData,
    requestedAt,
  };
  savePaymentToRedis(payload.correlationId, payload);
  paymentQueue.add("paymentsQueue", payload, {
    attempts: 10,
    backoff: { type: "exponential", delay: 500 },
  });
  
  return c.json({}, 202, {
    headers: [
      `Location: http://localhost:8080/payments/${paymentData.correlationId}`,
    ],
  });
}

//FIXME: Mover isso para um repository
export async function getSummaryHandler(c) {
  const summary = {
    default: {
      totalRequests: await redis.get("summary:default:count") || 0,
      totalAmount: await redis.get("summary:default:amount") || 0,
    },
    fallback: {
      totalRequests: await redis.get("summary:fallback:count") || 0,
      totalAmount: await redis.get("summary:fallback:amount") || 0,
    },
  };
  return c.json(summary);
}