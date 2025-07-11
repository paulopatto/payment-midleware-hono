import { z } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";

export const paymentPostSchema = z.object({
  correlationId: z.string().min(1).uuid(),
  amount: z.number(),
});

export const createPaymentRoute = createRoute({
  method: "post",
  path: "/payments",
  request: { body: { content: paymentPostSchema } },
  responses: {
    202: {
      description: "Register a payment",
      content: {
        "application/json": {
          schema: {},
        },
      },
    },
  },
});

