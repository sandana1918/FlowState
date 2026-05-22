import { pool } from '../db/client.js';
import { redis } from '../cache/redis.js';
import type { MetricRecord } from '../types/metric.types.js';
import { logger } from '../utils/logger.js';

export class MetricsService {
  async storeMetric(metric: MetricRecord) {
    await pool.query(
      `INSERT INTO metrics (
        container_id, container_name, cpu_percent, memory_mb, memory_percent,
        network_rx_bytes, network_tx_bytes, restart_count, collected_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        metric.containerId,
        metric.containerName,
        metric.cpuPercent,
        metric.memoryMb,
        metric.memoryPercent,
        metric.networkRxBytes,
        metric.networkTxBytes,
        metric.restartCount,
        metric.collectedAt
      ]
    );

    try {
      await redis.set(`metrics:latest:${metric.containerId}`, JSON.stringify(metric), 'EX', 60);
    } catch (error) {
      logger.warn('Failed to cache latest metric', { error: (error as Error).message });
    }
  }

  async getCurrentMetrics() {
    const result = await pool.query(
      `SELECT DISTINCT ON (container_id)
         id, container_id, container_name, cpu_percent, memory_mb, memory_percent,
         network_rx_bytes, network_tx_bytes, restart_count, collected_at
       FROM metrics
       ORDER BY container_id, collected_at DESC`
    );
    return result.rows.map(this.mapMetricRow);
  }

  async getMetricHistory(containerId: string, minutes: number) {
    const result = await pool.query(
      `SELECT id, container_id, container_name, cpu_percent, memory_mb, memory_percent,
              network_rx_bytes, network_tx_bytes, restart_count, collected_at
       FROM metrics
       WHERE container_id = $1
         AND collected_at >= NOW() - ($2::text || ' minutes')::interval
       ORDER BY collected_at ASC`,
      [containerId, minutes]
    );
    return result.rows.map(this.mapMetricRow);
  }

  async getServiceMetrics(containerId: string) {
    return this.getMetricHistory(containerId, 60);
  }

  async getAnomaliesForContainer(containerId: string) {
    const result = await pool.query(
      `SELECT id, container_id, container_name, metric_name, metric_value, zscore,
              mean_baseline, stddev_baseline, detected_at
       FROM anomalies
       WHERE container_id = $1
       ORDER BY detected_at DESC
       LIMIT 100`,
      [containerId]
    );
    return result.rows.map((row) => ({
      id: row.id,
      containerId: row.container_id,
      containerName: row.container_name,
      metricName: row.metric_name,
      metricValue: Number(row.metric_value),
      zscore: Number(row.zscore),
      meanBaseline: Number(row.mean_baseline),
      stddevBaseline: Number(row.stddev_baseline),
      detectedAt: new Date(row.detected_at).toISOString()
    }));
  }

  private mapMetricRow(row: Record<string, unknown>) {
    return {
      id: row.id as string,
      containerId: row.container_id as string,
      containerName: row.container_name as string,
      cpuPercent: Number(row.cpu_percent),
      memoryMb: Number(row.memory_mb),
      memoryPercent: Number(row.memory_percent),
      networkRxBytes: Number(row.network_rx_bytes ?? 0),
      networkTxBytes: Number(row.network_tx_bytes ?? 0),
      restartCount: Number(row.restart_count ?? 0),
      collectedAt: new Date(row.collected_at as string).toISOString()
    };
  }
}

export const metricsService = new MetricsService();

