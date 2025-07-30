import { Queue, Worker } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { redis } from "./redis";
import { paymentWorker } from "../payments/payment.worker";

const queuePrefix = process.env.NODE_ENV

export const paymentQueue = new Queue("paymentsQueue", { connection: redis, prefix: queuePrefix });
export const QUEUE_ADMIN_UI = "/admin/queue";

const serverAdapter = new HonoAdapter(serveStatic);
serverAdapter.setBasePath(QUEUE_ADMIN_UI);

createBullBoard({
  queues: [new BullMQAdapter(paymentQueue)],
  serverAdapter,
});

export const bullAdmin = serverAdapter;

new Worker("paymentsQueue", paymentWorker, {
  connection: redis
});
