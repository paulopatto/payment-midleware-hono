import { metrics, trace } from '@opentelemetry/api';
import { env } from "../shared/env";
import { redis, redisPrefix } from "../shared/redis";

const meter = metrics.getMeter('rinha-bullmq');
const processedCounter = meter.createCounter('bullmq_jobs_processed', { description: 'Jobs processados' });
const failedCounter = meter.createCounter('bullmq_jobs_failed', { description: 'Jobs falhos' });
const fallbackCounter = meter.createCounter('bullmq_jobs_fallback', { description: 'Jobs enviados para fallback' });
const durationHistogram = meter.createHistogram('bullmq_job_duration_ms', { description: 'Duração dos jobs em ms' });

const processors = {
  default: {
    endpoint: env.PAYMENT_PROCESSOR_URL_DEFAULT,
    name: "default",
  },
  fallback: {
    endpoint: env.PAYMENT_PROCESSOR_URL_FALLBACK,
    name: "fallback",
  },
};

async function sendPaymentRequest(
  processor: { endpoint: string; name: string },
  payload: any,
) {
  const response = await fetch(`${processor.endpoint}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Payment processor responded with status ${response.status}`,
    );
  }

  return response;
}

//FIXME: Arrumar a tipagem de paymentData
async function registerPayment(
  processor: { endpoint: string; name: string },
  paymentData: any,
) {
  const procName = processor.name;
  const multi = redis.multi();
  multi.incr(`${redisPrefix}summary:${procName}:count`);
  multi.incrbyfloat(
    `${redisPrefix}summary:${procName}:amount`,
    paymentData.amount,
  );
  // DOC: https://redis.io/docs/latest/commands/zadd/
  multi.zadd(
    `${redisPrefix}summary:${procName}:transactions`,
    paymentData.requestedAt
      ? new Date(paymentData.requestedAt).getTime()
      : Date.now(),
    JSON.stringify(paymentData),
  );

  await multi.exec();
}

export async function paymentWorker(job: any) {
  const span = trace.getTracer('rinha-bullmq').startSpan('process_payment_job', {
    attributes: { jobId: job.id, correlationId: job.data?.correlationId }
  });
  const startTime = Date.now();
  const paymentData = job.data;
  let processor = processors.default;

  try {
    //FIXME: Mudar isso para que dada as tentativas ele jogue para a fila de fallback
    if (
      job.attemptsMade >= env.PAYMENT_PROCESSOR_RETRY_LIMIT_BEFORE_USE_FALLBACK
    ) {
      console.warn(
        `Using fallback payment processor after ${job.attemptsMade} attempts`,
        { correlationId: paymentData.correlationId },
      );
      fallbackCounter.add(1);
      processor = processors.fallback;
    }

    const response = await sendPaymentRequest(processor, paymentData);

    if (response.ok) {
      processedCounter.add(1);
      registerPayment(processor, paymentData);
    }

    return null;
  } catch (error: any) {
    failedCounter.add(1);
    span.recordException(error);
    console.error(`Error with processor due ${error.message}`, {
      correlationId: paymentData.correlationId,
    });
    throw error;
  }
  finally {
    const duration = Date.now() - startTime;
    durationHistogram.record(duration);
    span.setAttribute('jobDurationMs', duration);
    span.end();
  }
}

