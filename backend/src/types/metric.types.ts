export interface MetricRecord {
  id?: string;
  containerId: string;
  containerName: string;
  cpuPercent: number;
  memoryMb: number;
  memoryPercent: number;
  networkRxBytes: number;
  networkTxBytes: number;
  restartCount: number;
  collectedAt: string;
}

export interface MetricHistoryPoint extends MetricRecord {}

export interface AnomalyRecord {
  id?: string;
  containerId: string;
  containerName: string;
  metricName: 'cpu_percent' | 'memory_percent';
  metricValue: number;
  zscore: number;
  meanBaseline: number;
  stddevBaseline: number;
  detectedAt: string;
}

export interface RollingMetricWindow {
  key: string;
  values: number[];
}

