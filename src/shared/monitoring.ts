// DOCS: https://www.npmjs.com/package/@opentelemetry/sdk-node
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { logger } from '../shared/logger';
import { env } from "./env";

const prometheusPort = Number(env.PROMETHEUS_PORT);

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
  }),
  metricReader: new PrometheusExporter({ port: prometheusPort }),
  //metricExporter: new PrometheusExporter({ port: prometheusPort }),
  instrumentations: [getNodeAutoInstrumentations()],
});


sdk.start();
logger.info(`Prometheus metrics exposed at http://localhost:${prometheusPort}/metrics`);
