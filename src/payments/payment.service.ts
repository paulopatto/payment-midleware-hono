import { savePaymentToRedis } from "./payment.repository";
import { paymentQueue } from "../shared/queue";
import { redis, redisPrefix } from "../shared/redis";

export async function createPaymentHandler(c: any) {
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

async function getTransactions(procName: string, start: number, end: number) {
  const key = `${redisPrefix}summary:${procName}:transactions`;
  const results = await redis.zrangebyscore(key, start, end);
  const parsedResults = results.map((item) => JSON.parse(item));
  return parsedResults;
}

//FIXME: Mover isso para um repository
export async function getSummaryHandler(c) {
  const start = c.req.query("from")
    ? new Date(c.req.query("from")).getTime()
    : 0;
  const end = c.req.query("to")
    ? new Date(c.req.query("to")).getTime()
    : Date.now();

  const defaultTransactions = await getTransactions("default", start, end);
  const fallbackTransactions = await getTransactions("fallback", start, end);

  // const summary = {
  //   default: {
  //     totalRequests: await redis.get("summary:default:count") || 0,
  //     totalAmount: await redis.get("summary:default:amount") || 0,
  //   },
  //   fallback: {
  //     totalRequests: await redis.get("summary:fallback:count") || 0,
  //     totalAmount: await redis.get("summary:fallback:amount") || 0,
  //   },
  // };
  const summary = {
    default: {
      totalRequests: defaultTransactions.length,
      totalAmount: await defaultTransactions.reduce((acc, t) => acc + t.amount, 0),
    },
    fallback: {
      totalRequests: fallbackTransactions.length,
      totalAmount: await fallbackTransactions.reduce((acc, t) => acc + t.amount, 0),
    },
  };

  return c.json(summary);
}

