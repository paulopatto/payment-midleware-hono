import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import { v4 as uuidv4 } from "uuid";

const app = new OpenAPIHono();

const paymentPostSchema = z.object({
  correlationId: z.string().min(1).uuid(),
  amount: z.number(),
});

app.get("/", (c) => c.text("Hello Node.js!"));
app.get("/health", (c) =>
  c.json({
    services: [
      {
        api: { status: "UP" },
        workers: { status: "OK" },
        payment_processor_default: { status: "UP" },
        payment_processor_fallback: { status: "UP" },
      },
    ],
  }),
);
app.get("/payments-summary", (c) => c.json({ status: "OK" }));

const createPaymentRoute = createRoute({
  method: "post",
  path: "/payments",
  request: { params: paymentPostSchema },
  responses: {
    201: {
      description: "Register a payment",
      content: {
        "application/json": {
          schema: {},
        },
      },
    },
  },
});
app.openapi(createPaymentRoute, (c) => {
  const id = uuidv4();
  c.json({}, 201, { headers: [`Location: ${id}`] });
});

export default app;

