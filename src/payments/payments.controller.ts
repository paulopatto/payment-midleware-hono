import { createRoute } from "@hono/zod-openapi";
import { paymentPostSchema, paymentSummarySchema } from "./payment.types";



export const createPaymentRoute = createRoute({
  method: "post",
  path: "/payments",
  request: {
    body: { 
      content: { 
        "application/json": { 
          schema: paymentPostSchema 
        } 
      },
    },
  },
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

export const getSummaryRoute = createRoute({
  method: "get",
  path: "/payments-summary",
  request: {},
  responses: {
    200: {
      description: "Get payment summary",
      content: {
        "application/json": {
          schema: paymentSummarySchema,
        },
      },
    },
  },
});

