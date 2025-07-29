import { register } from "module";
import { env } from "../shared/env";
import { redis, redisPrefix } from "../shared/redis";


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

async function sendPaymentRequest(processor: { endpoint: string; name: string }, payload: any) {
  const response = await fetch(`${processor.endpoint}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Payment processor responded with status ${response.status}`);
  }

  return response;
}

//FIXME: Arrumar a tipagem de paymentData
async function registerPayment(processor: { endpoint: string; name: string }, paymentData: any) {
  const procName = processor.name;
  const multi = redis.multi();
  multi.incr(`${redisPrefix}summary:${procName}:count`);
  multi.incrbyfloat(`${redisPrefix}summary:${procName}:amount`, paymentData.amount);
  // DOC: https://redis.io/docs/latest/commands/zadd/
  multi.zadd(
    `${redisPrefix}summary:${procName}:transactions`,
    paymentData.requestedAt ? new Date(paymentData.requestedAt).getTime() : Date.now(),
    JSON.stringify(paymentData)
  );

  await multi.exec();
}

export async function paymentWorker(job) {

  const paymentData = job.data;
  let processor = processors.default;

  try {

    //FIXME: Mudar isso para que dada as tentativas ele jogue para a fila de fallback
    if(job.attemptsMade >= 2) {
      console.warn(`Retrying payment job ${job.id} for correlationId ${paymentData.correlationId}`);
    }

    if (job.attemptsMade >= env.PAYMENT_PROCESSOR_RETRY_LIMIT_BEFORE_USE_FALLBACK) {
      console.warn(
        `Using fallback payment processor after ${job.attemptsMade} attempts`,
        { correlationId: paymentData.correlationId },
      );
      processor = processors.fallback;
    }

    const response = await sendPaymentRequest(
      processor,
      paymentData,
    );

    if (response.ok) {
      registerPayment(
        processor,
        paymentData
      );
    }

    return null;
  } catch (error: any) {
    console.error(
      `Error with processor due ${error.message}`,
      {correlationId: paymentData.correlationId, error}
    );
    throw error;
  }
}

