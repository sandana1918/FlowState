import { pool } from '../db/client.js';
import { env } from '../config/env.js';
import { calculateZScore } from '../utils/zscoreDetector.js';
import type { MetricRecord, AnomalyRecord } from '../types/metric.types.js';
import { correlationService } from './correlation.service.js';
import { incidentService } from './incident.service.js';
import { socketHandler } from '../socket/socketHandler.js';

type MetricName = 'cpu_percent' | 'memory_percent';

const normalizeMetricName = (metricName: MetricName) =>
  metricName === 'cpu_percent' ? 'cpuPercent' : 'memoryPercent';

export class AnomalyService {
  private rollingWindows = new Map<string, number[]>();

  private getKey(containerId: string, metricName: MetricName) {
    return `${containerId}:${metricName}`;
  }

  async observeMetric(metric: MetricRecord) {
    await Promise.all([
      this.checkMetric(metric, 'cpu_percent', metric.cpuPercent),
      this.checkMetric(metric, 'memory_percent', metric.memoryPercent)
    ]);
  }

  private async checkMetric(metric: MetricRecord, metricName: MetricName, value: number) {
    const key = this.getKey(metric.containerId, metricName);
    const window = this.rollingWindows.get(key) ?? [];
    if (window.length >= env.ANOMALY_WINDOW_SIZE) {
      const result = calculateZScore(window, value, env.ANOMALY_ZSCORE_THRESHOLD);
      if (result?.isAnomaly) {
        const anomaly: AnomalyRecord = {
          containerId: metric.containerId,
          containerName: metric.containerName,
          metricName,
          metricValue: value,
          zscore: Number(result.zscore.toFixed(2)),
          meanBaseline: Number(result.mean.toFixed(2)),
          stddevBaseline: Number(result.stddev.toFixed(2)),
          detectedAt: metric.collectedAt
        };
        await this.storeAnomaly(anomaly, metric.restartCount);
      }
    }

    const nextWindow = [...window, value].slice(-env.ANOMALY_WINDOW_SIZE);
    this.rollingWindows.set(key, nextWindow);
  }

  private async storeAnomaly(anomaly: AnomalyRecord, restartCount: number) {
    const result = await pool.query(
      `INSERT INTO anomalies (
        container_id, container_name, metric_name, metric_value, zscore,
        mean_baseline, stddev_baseline, detected_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        anomaly.containerId,
        anomaly.containerName,
        anomaly.metricName,
        anomaly.metricValue,
        anomaly.zscore,
        anomaly.meanBaseline,
        anomaly.stddevBaseline,
        anomaly.detectedAt
      ]
    );

    const saved: AnomalyRecord = {
      id: result.rows[0].id,
      containerId: result.rows[0].container_id,
      containerName: result.rows[0].container_name,
      metricName: result.rows[0].metric_name,
      metricValue: Number(result.rows[0].metric_value),
      zscore: Number(result.rows[0].zscore),
      meanBaseline: Number(result.rows[0].mean_baseline),
      stddevBaseline: Number(result.rows[0].stddev_baseline),
      detectedAt: new Date(result.rows[0].detected_at).toISOString()
    };
    socketHandler.emitAnomalyDetected(saved);

    const correlation = await correlationService.correlate(saved);
    if (correlation.confidence !== 'NONE') {
      await incidentService.openIncident(saved, correlation, restartCount);
    }
  }
}

export const anomalyService = new AnomalyService();

