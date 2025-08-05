/**
 * 1. Inicialização do OpenTelemetry
 *    Crie um arquivo de bootstrap, por exemplo, src/observability.ts, para configurar o SDK do OpenTelemetry.
 *    Configure os instrumentations automáticos para HTTP, BullMQ, Redis e Node.js.
 *    Adicione exportadores para Jaeger (traces) e Prometheus (metrics).
 */

/**
 * 2. Pontos a monitorar
 *    HTTP: tempo de resposta, status, erros, throughput.
 *    BullMQ: jobs criados, processados, falhas, tempo de execução, tamanho das filas.
 *    Redis: latência, erros de conexão.
 *    Node.js VM: heap, uso de memória, threads, event loop lag.
 *    Custom Metrics: pagamentos processados, pagamentos com erro, tentativas de fallback.
 */

/**
 * 3. Integração no projeto
 *    Importe o bootstrap de observabilidade no início do index.ts.
 *    Adicione instrumentação customizada nos handlers de pagamento e workers do BullMQ para registrar métricas e traces relevantes.
 */

// DOCS: https://www.npmjs.com/package/@opentelemetry/sdk-node
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';


const prometheusPort = 9464;

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  metricReader: new PrometheusExporter({ port: prometheusPort }),
  //metricExporter: new PrometheusExporter({ port: prometheusPort }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
console.log(`Prometheus metrics exposed at http://localhost:${prometheusPort}/metrics`);
