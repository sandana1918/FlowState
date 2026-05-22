import cron from 'node-cron';
import { dockerService } from '../services/docker.service.js';
import { metricsService } from '../services/metrics.service.js';
import { anomalyService } from '../services/anomaly.service.js';
import { socketHandler } from '../socket/socketHandler.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type { MetricRecord } from '../types/metric.types.js';

const buildSchedule = (intervalSeconds: number) => `*/${Math.max(intervalSeconds, 1)} * * * * *`;

export class MetricCollector {
  start() {
    cron.schedule(buildSchedule(env.METRIC_COLLECTION_INTERVAL), async () => {
      try {
        const containersResult = await dockerService.listContainers();
        const metrics: MetricRecord[] = [];

        for (const container of containersResult.data) {
          if (containersResult.mode === 'fallback' || container.id.startsWith('fallback-')) {
            const simulatedMetric: MetricRecord = {
              containerId: container.id,
              containerName: container.name,
              cpuPercent: Number((25 + Math.random() * 40).toFixed(2)),
              memoryMb: Number((250 + Math.random() * 300).toFixed(2)),
              memoryPercent: Number((35 + Math.random() * 45).toFixed(2)),
              networkRxBytes: Math.floor(Math.random() * 100000),
              networkTxBytes: Math.floor(Math.random() * 100000),
              restartCount: 0,
              collectedAt: new Date().toISOString()
            };
            await metricsService.storeMetric(simulatedMetric);
            await anomalyService.observeMetric(simulatedMetric);
            metrics.push(simulatedMetric);
            continue;
          }

          const stats = await dockerService.getContainerStats(container.id);
          const metric: MetricRecord = {
            containerId: stats.containerId,
            containerName: stats.containerName,
            cpuPercent: stats.cpuPercent,
            memoryMb: stats.memoryMb,
            memoryPercent: stats.memoryPercent,
            networkRxBytes: stats.networkRxBytes,
            networkTxBytes: stats.networkTxBytes,
            restartCount: stats.restartCount,
            collectedAt: stats.collectedAt
          };
          await metricsService.storeMetric(metric);
          await anomalyService.observeMetric(metric);
          metrics.push(metric);
        }

        socketHandler.emitMetricsUpdate(metrics, containersResult.mode, containersResult.warning);
      } catch (error) {
        logger.error('Metric collection cycle failed', { error: (error as Error).message });
      }
    });
  }
}

export const metricCollector = new MetricCollector();

