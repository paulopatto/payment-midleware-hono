import { metrics, trace } from '@opentelemetry/api';
import { savePaymentToRedis } from "./payment.repository";
import { paymentQueue } from "../shared/queue";
import { redis, redisPrefix } from "../shared/redis";
import { logger } from '../shared/logger';

const meter = metrics.getMeter('rinha-payments');
const paymentsReceived = meter.createCounter('payments_received', { description: 'Pagamentos recebidos' });
const paymentProcessingDuration = meter.createHistogram('payment_processing_duration', { description: 'Duração do processamento de pagamentos' });

export async function createPaymentHandler(c: any) {
  const span = trace.getTracer('rinha-payments').startSpan('create_payment');
  const startTime = Date.now();
  const paymentData = await c.req.json();
  const requestedAt = new Date().toISOString();
  const payload = {
    ...paymentData,
    requestedAt,
  };

  try {
    savePaymentToRedis(payload.correlationId, payload);
    paymentQueue.add("paymentsQueue", payload, {
      attempts: 10,
      backoff: { type: "exponential", delay: 500 },
    });

    logger.info(`Payment request received`, { correlationId: payload.correlationId });

    return c.json({}, 202, {
      headers: [
        `Location: http://localhost:8080/payments/${paymentData.correlationId}`,
      ],
    });
  } catch(error: any) {
    logger.error('Error processing payment', { error, correlationId: payload.correlationId });
    span.recordException(error);
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    paymentProcessingDuration.record(duration);
    span.setAttribute('paymentDurationMs', duration);
    span.end();
  }

}

async function getTransactions(procName: string, start: number, end: number) {
  const key = `${redisPrefix}summary:${procName}:transactions`;
  const results = await redis.zrangebyscore(key, start, end);
  const parsedResults = results.map((item) => JSON.parse(item));
  return parsedResults;
}

//FIXME: Mover isso para um repository
export async function getSummaryHandler(c: any) {
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
  //     totalRequests: (await redis.get("summary:default:count")) || 0,
  //     totalAmount: (await redis.get("summary:default:amount")) || 0,
  //   },
  //   fallback: {
  //     totalRequests: (await redis.get("summary:fallback:count")) || 0,
  //     totalAmount: (await redis.get("summary:fallback:amount")) || 0,
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

