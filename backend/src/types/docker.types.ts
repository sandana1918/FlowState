import type { Mode } from './api.types.js';

export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  imageTag: string;
  state: string;
  status: string;
  createdAt: string;
}

export interface ContainerStats {
  containerId: string;
  containerName: string;
  cpuPercent: number;
  memoryMb: number;
  memoryLimitMb: number;
  memoryPercent: number;
  networkRxBytes: number;
  networkTxBytes: number;
  blockReadBytes: number;
  blockWriteBytes: number;
  restartCount: number;
  status: string;
  collectedAt: string;
  mode: Mode;
  warning?: string;
}

export interface ContainerInspect {
  id: string;
  name: string;
  image: string;
  state: string;
  restartCount: number;
  startedAt?: string;
  finishedAt?: string;
  env: string[];
  labels: Record<string, string>;
}

export interface ParsedLogLine {
  raw: string;
  timestamp?: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

