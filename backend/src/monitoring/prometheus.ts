import client from 'prom-client';

export const metricCollectionCyclesTotal = new client.Counter({
  name: 'flowstate_metric_collection_cycles_total',
  help: 'Total number of metric collection cycles completed'
});

export const metricCollectionFailuresTotal = new client.Counter({
  name: 'flowstate_metric_collection_failures_total',
  help: 'Total number of metric collection cycle failures'
});

export const metricCollectionDurationMs = new client.Histogram({
  name: 'flowstate_metric_collection_duration_ms',
  help: 'Duration of the metric collection cycle in milliseconds',
  buckets: [25, 50, 100, 250, 500, 1000, 2500, 5000]
});

export const containerCpuPercentGauge = new client.Gauge({
  name: 'flowstate_container_cpu_percent',
  help: 'Latest CPU usage percentage by container',
  labelNames: ['container_id', 'container_name']
});

export const containerMemoryPercentGauge = new client.Gauge({
  name: 'flowstate_container_memory_percent',
  help: 'Latest memory usage percentage by container',
  labelNames: ['container_id', 'container_name']
});

export const containerRestartCountGauge = new client.Gauge({
  name: 'flowstate_container_restart_count',
  help: 'Latest restart count by container',
  labelNames: ['container_id', 'container_name']
});

export const anomaliesDetectedTotal = new client.Counter({
  name: 'flowstate_anomalies_detected_total',
  help: 'Total anomalies detected',
  labelNames: ['container_name', 'metric_name']
});

export const incidentsOpenedTotal = new client.Counter({
  name: 'flowstate_incidents_opened_total',
  help: 'Total incidents opened',
  labelNames: ['severity', 'affected_service']
});

export const deploymentsReceivedTotal = new client.Counter({
  name: 'flowstate_deployments_received_total',
  help: 'Total deployment webhook events received',
  labelNames: ['repo', 'branch']
});

export const webhookSignatureFailuresTotal = new client.Counter({
  name: 'flowstate_webhook_signature_failures_total',
  help: 'Total invalid GitHub webhook signatures seen'
});

export const setMetricSnapshotGauges = (metric: {
  containerId: string;
  containerName: string;
  cpuPercent: number;
  memoryPercent: number;
  restartCount: number;
}) => {
  const labels = {
    container_id: metric.containerId,
    container_name: metric.containerName
  };
  containerCpuPercentGauge.set(labels, metric.cpuPercent);
  containerMemoryPercentGauge.set(labels, metric.memoryPercent);
  containerRestartCountGauge.set(labels, metric.restartCount);
};

