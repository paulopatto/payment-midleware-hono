import { OpenAPIHono } from "@hono/zod-openapi";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { paymentQueue } from "./queue";
import { createPaymentRoute } from "./payments";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

const app = new OpenAPIHono();
const serverAdapter = new HonoAdapter(serveStatic);
serverAdapter.setBasePath("/admin/queue");

createBullBoard({
  queues: [new BullMQAdapter(paymentQueue)],
  serverAdapter,
});

app.route("/admin/queue", serverAdapter.registerPlugin());
app.get("/payments-summary", (c) => c.json({ status: "pending" }));

app.openapi(createPaymentRoute, async (c) => {
  const paymentData = await c.req.json();
  paymentQueue.add("paymentsQueue", paymentData);
  return c.json({}, 202, {
    headers: [
      `Location: http://localhost:8080/payments/${paymentData.correlationId}`,
    ],
  });
});

export default app;

