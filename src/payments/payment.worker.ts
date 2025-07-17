import { env } from "../shared/env";
import { redis } from "../shared/redis";

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

export async function paymentWorker(job: any) {
  
  const paymentData = job.data;
  let processor = processors.default;

  try {

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
      const procName = processor.name;
      const multi = redis.multi();
      multi.incr(`summary:${procName}:count`);
      multi.incrbyfloat(`summary:${procName}:amount`, paymentData.amount);
      await multi.exec();
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

