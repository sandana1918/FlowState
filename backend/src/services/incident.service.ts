import { pool } from '../db/client.js';
import { calculateBlastRadius } from '../utils/serviceGraph.js';
import { resolutionService } from './resolution.service.js';
import type {
  IncidentRecord,
  IncidentSeverity,
  IncidentStatus,
  TimelineEvent
} from '../types/incident.types.js';
import type { AnomalyRecord } from '../types/metric.types.js';
import type { CorrelationResult } from './correlation.service.js';
import { socketHandler } from '../socket/socketHandler.js';

const severityFromZScore = (zscore: number): IncidentSeverity => {
  if (zscore >= 4) {
    return 'critical';
  }
  if (zscore >= 3) {
    return 'high';
  }
  if (zscore >= 2.5) {
    return 'medium';
  }
  return 'low';
};

const timelineTime = (value: string) => new Date(value).toLocaleTimeString('en-US', { hour12: false });

export class IncidentService {
  async openIncident(anomaly: AnomalyRecord, correlation: CorrelationResult, restartCount?: number) {
    const severity = severityFromZScore(anomaly.zscore);
    const blastRadius = await calculateBlastRadius(anomaly.containerName);
    const resolutionSteps = resolutionService.generate(
      anomaly,
      correlation.deployment,
      restartCount
    );

    const timeline: TimelineEvent[] = [];
    if (correlation.deployment) {
      timeline.push({
        time: timelineTime(correlation.deployment.receivedAt ?? correlation.deployment.pushedAt),
        event: `Deployment pushed by ${correlation.deployment.author}`,
        type: 'deployment'
      });
    }
    timeline.push({
      time: timelineTime(anomaly.detectedAt),
      event: `${anomaly.metricName} spike detected on ${anomaly.containerName} (${anomaly.metricValue.toFixed(2)} vs baseline ${anomaly.meanBaseline.toFixed(2)})`,
      type: 'anomaly'
    });
    timeline.push({
      time: timelineTime(anomaly.detectedAt),
      event: `Incident opened: ${severity.toUpperCase()} severity`,
      type: 'incident'
    });
    timeline.push({
      time: timelineTime(anomaly.detectedAt),
      event: `Blast radius calculated: ${blastRadius.totalAffectedCount - 1} dependent services affected`,
      type: 'blast_radius'
    });

    const title = `${anomaly.containerName} ${anomaly.metricName} anomaly`;
    const result = await pool.query(
      `INSERT INTO incidents (
        title, severity, status, affected_service, affected_container_id, trigger_metric, trigger_value,
        trigger_zscore, correlated_deployment_id, correlation_confidence, blast_radius, timeline,
        resolution_steps, opened_at, updated_at
      ) VALUES ($1,$2,'open',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())
      RETURNING *`,
      [
        title,
        severity,
        anomaly.containerName,
        anomaly.containerId,
        anomaly.metricName,
        anomaly.metricValue,
        anomaly.zscore,
        correlation.deployment?.id ?? null,
        correlation.confidence,
        JSON.stringify(blastRadius),
        JSON.stringify(timeline),
        JSON.stringify(resolutionSteps)
      ]
    );

    const incident = this.mapIncident(result.rows[0], correlation.deployment ?? null);
    socketHandler.emitIncidentOpened(incident);
    return incident;
  }

  async listIncidents(status?: IncidentStatus) {
    const result = await pool.query(
      `SELECT i.*, d.repo, d.branch, d.commit_hash, d.commit_message, d.author, d.author_email, d.pushed_at, d.received_at
       FROM incidents i
       LEFT JOIN deployments d ON d.id = i.correlated_deployment_id
       ${status ? 'WHERE i.status = $1' : ''}
       ORDER BY i.opened_at DESC`,
      status ? [status] : []
    );
    return result.rows.map((row) =>
      this.mapIncident(
        row,
        row.commit_hash
          ? {
              id: row.correlated_deployment_id,
              repo: row.repo,
              branch: row.branch,
              commitHash: row.commit_hash,
              commitMessage: row.commit_message ?? '',
              author: row.author ?? '',
              authorEmail: row.author_email ?? '',
              pushedAt: new Date(row.pushed_at).toISOString(),
              receivedAt: new Date(row.received_at).toISOString()
            }
          : null
      )
    );
  }

  async getIncident(id: string) {
    const result = await pool.query(
      `SELECT i.*, d.repo, d.branch, d.commit_hash, d.commit_message, d.author, d.author_email, d.pushed_at, d.received_at
       FROM incidents i
       LEFT JOIN deployments d ON d.id = i.correlated_deployment_id
       WHERE i.id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return null;
    }
    const row = result.rows[0];
    return this.mapIncident(
      row,
      row.commit_hash
        ? {
            id: row.correlated_deployment_id,
            repo: row.repo,
            branch: row.branch,
            commitHash: row.commit_hash,
            commitMessage: row.commit_message ?? '',
            author: row.author ?? '',
            authorEmail: row.author_email ?? '',
            pushedAt: new Date(row.pushed_at).toISOString(),
            receivedAt: new Date(row.received_at).toISOString()
          }
        : null
    );
  }

  async updateStatus(id: string, status: IncidentStatus) {
    const result = await pool.query(
      `UPDATE incidents
       SET status = $2,
           resolved_at = CASE WHEN $2 = 'resolved' THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, status]
    );
    if (result.rowCount === 0) {
      return null;
    }
    const incident = this.mapIncident(result.rows[0], null);
    socketHandler.emitIncidentUpdated(incident);
    return incident;
  }

  private mapIncident(row: Record<string, unknown>, deployment: IncidentRecord['correlatedDeployment']) {
    return {
      id: row.id as string,
      title: row.title as string,
      severity: row.severity as IncidentSeverity,
      status: row.status as IncidentStatus,
      affectedService: row.affected_service as string,
      affectedContainerId: (row.affected_container_id as string | null) ?? undefined,
      triggerMetric: (row.trigger_metric as string | null) ?? undefined,
      triggerValue: row.trigger_value ? Number(row.trigger_value) : undefined,
      triggerZscore: row.trigger_zscore ? Number(row.trigger_zscore) : undefined,
      correlatedDeploymentId: (row.correlated_deployment_id as string | null) ?? null,
      correlationConfidence: (row.correlation_confidence as IncidentRecord['correlationConfidence']) ?? 'NONE',
      blastRadius: (row.blast_radius as IncidentRecord['blastRadius']) ?? {
        affectedService: row.affected_service as string,
        directDependents: [],
        indirectDependents: [],
        totalAffectedCount: 1
      },
      timeline: (row.timeline as IncidentRecord['timeline']) ?? [],
      resolutionSteps: (row.resolution_steps as string[]) ?? [],
      openedAt: new Date(row.opened_at as string).toISOString(),
      resolvedAt: row.resolved_at ? new Date(row.resolved_at as string).toISOString() : null,
      updatedAt: new Date((row.updated_at as string) ?? row.opened_at as string).toISOString(),
      correlatedDeployment: deployment
    } satisfies IncidentRecord;
  }
}

export const incidentService = new IncidentService();

