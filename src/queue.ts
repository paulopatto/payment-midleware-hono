import { Queue, Worker } from "bullmq";
import { env } from "./env";
import IORedis from "ioredis";

const redis = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const paymentQueue = new Queue("paymentsQueue", { connection: redis });

export async function paymentWorker(job, done) {
  const paymentData = job.data;
  console.log(
    `Processing payment with correlationId: ${paymentData.correlationId}`,
  );

  try {
    console.warn("Simulation register payment at third party");
    return null;
  } catch (error: any) {
    console.error(`Error with processor due ${error.message}`, error);
    return error;
  }
}

new Worker("paymentsQueue", paymentWorker, { connection: redis });

