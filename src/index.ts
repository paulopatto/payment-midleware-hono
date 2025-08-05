import './shared/monitoring';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { logger } from './shared/logger';
import { serve } from "@hono/node-server";
import { env } from "./shared/env";
import app from "./app";

const PORT = env.PORT;
const tracer = trace.getTracer('rinha-server');

const server = serve(
  { fetch: app.fetch, port: Number(PORT) },
  ({ address, port }) => {
    const span = tracer.startSpan('server_start', {
      attributes: { address, port }
    });
    logger.info(`Server is running on ${address}:${port}...`);
    logger.info(`Press [ctrl] + C (^C) to exit.`);
    span.end();
  },
);

// graceful shutdown
process.on("SIGINT", () => {
  const span = tracer.startSpan('server_shutdown', {
    attributes: { signal: 'SIGINT' }
  });
  logger.info('Received SIGINT, shutting down server...');
  server.close();
  span.end();
  process.exit(0);
});

process.on("SIGTERM", () => {
  const span = tracer.startSpan('server_shutdown', {
    attributes: { signal: 'SIGTERM' }
  });
  logger.info('Received SIGTERM, shutting down server...');
  server.close((err) => {
    if (err) {
      logger.error(err);
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      span.end();
      process.exit(1);
    }
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    process.exit(0);
  });
});

