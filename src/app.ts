import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from 'hono/logger'

import { bullAdmin, QUEUE_ADMIN_UI } from "./shared/queue";
import { createPaymentRoute, getSummaryRoute } from "./payments/payments.controller";
import { createPaymentHandler, getSummaryHandler } from "./payments/payment.service";

const app = new OpenAPIHono();

app.use(logger());

app.route(QUEUE_ADMIN_UI, bullAdmin.registerPlugin());
app.openapi(getSummaryRoute, getSummaryHandler);
app.openapi(createPaymentRoute, createPaymentHandler);

export default app;

