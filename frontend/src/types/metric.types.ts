export interface ContainerMetric {
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

export interface Anomaly {
  id?: string;
  containerId: string;
  containerName: string;
  metricName: string;
  metricValue: number;
  zscore: number;
  meanBaseline: number;
  stddevBaseline: number;
  detectedAt: string;
}

