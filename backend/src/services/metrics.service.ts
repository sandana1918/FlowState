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

  async getDashboardHistory(minutes: number) {
    const result = await pool.query(
      `SELECT id, container_id, container_name, cpu_percent, memory_mb, memory_percent,
              network_rx_bytes, network_tx_bytes, restart_count, collected_at
       FROM metrics
       WHERE collected_at >= NOW() - ($1::text || ' minutes')::interval
       ORDER BY collected_at ASC`,
      [minutes]
    );
    return result.rows.map(this.mapMetricRow);
  }

  async getAnomaliesForContainer(containerId: string) {
    const result = await pool.query(
      `SELECT a.id, a.container_id, a.container_name, a.metric_name, a.metric_value, a.zscore,
              a.mean_baseline, a.stddev_baseline, a.detected_at,
              i.id AS linked_incident_id
       FROM anomalies a
       LEFT JOIN LATERAL (
         SELECT id
         FROM incidents
         WHERE affected_container_id = a.container_id
           AND trigger_metric = a.metric_name
           AND opened_at >= a.detected_at - INTERVAL '5 minutes'
           AND opened_at <= a.detected_at + INTERVAL '30 minutes'
         ORDER BY ABS(EXTRACT(EPOCH FROM (opened_at - a.detected_at))) ASC
         LIMIT 1
       ) i ON TRUE
       WHERE a.container_id = $1
       ORDER BY a.detected_at DESC
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
      detectedAt: new Date(row.detected_at).toISOString(),
      linkedIncidentId: row.linked_incident_id ?? undefined
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
