import { z } from "@hono/zod-openapi";

export const paymentPostSchema = z.object({
  correlationId: z.string().min(1).uuid(),
  amount: z.number(),
});

export const paymentSummarySchema = z.object({
  default: z.object({
    totalRequests: z.number(),
    totalAmount: z.number(),
  }),
  fallback: z.object({
    totalRequests: z.number(),
    totalAmount: z.number(),
  }),
});