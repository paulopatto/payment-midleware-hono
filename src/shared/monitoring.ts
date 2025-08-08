import { NodeSDK } from '@opentelemetry/sdk-node'; // DOCS: https://www.npmjs.com/package/@opentelemetry/sdk-node
// import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'; // DOCS: https://docs.bullmq.io/guide/telemetry
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { logger } from '../shared/logger';
import { env } from "./env";

const prometheusPort = Number(env.PROMETHEUS_PORT);

const sdk = new NodeSDK({
  serviceName: 'rinha-backend', //TODO: Mover isso para uma env.
  traceExporter: new OTLPTraceExporter({
    url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  metricReader: new PrometheusExporter({ port: prometheusPort }),
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: new OTLPMetricExporter({
  //     url: 'http://127.0.0.1:4318/v1/metrics'
  //   }),
  // }),
  instrumentations: [getNodeAutoInstrumentations()],
});


sdk.start();
logger.info(`Prometheus metrics exposed at /metrics on port ${prometheusPort}`, {otel_endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT, prometheusPort});
