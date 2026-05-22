import { pool } from '../db/client.js';
import { env } from '../config/env.js';
import type { DeploymentRecord, CorrelationConfidence } from '../types/incident.types.js';
import type { AnomalyRecord } from '../types/metric.types.js';

export interface CorrelationResult {
  deployment: DeploymentRecord | null;
  confidence: CorrelationConfidence;
  timeDeltaMinutes?: number;
}

const confidenceFromDelta = (deltaMinutes: number): CorrelationConfidence => {
  if (deltaMinutes <= 5) {
    return 'HIGH';
  }
  if (deltaMinutes <= 15) {
    return 'MEDIUM';
  }
  if (deltaMinutes <= env.CORRELATION_WINDOW_MINUTES) {
    return 'LOW';
  }
  return 'NONE';
};

export class CorrelationService {
  async correlate(anomaly: AnomalyRecord): Promise<CorrelationResult> {
    const result = await pool.query(
      `SELECT id, repo, branch, commit_hash, commit_message, author, author_email, pushed_at, received_at
       FROM deployments
       WHERE received_at >= NOW() - ($1::text || ' minutes')::interval
       ORDER BY received_at DESC
       LIMIT 1`,
      [env.CORRELATION_WINDOW_MINUTES]
    );

    if (result.rowCount === 0) {
      return {
        deployment: null,
        confidence: 'NONE'
      };
    }

    const row = result.rows[0];
    const deltaMinutes =
      (new Date(anomaly.detectedAt).getTime() - new Date(row.received_at).getTime()) / 60000;

    return {
      deployment: {
        id: row.id,
        repo: row.repo,
        branch: row.branch,
        commitHash: row.commit_hash,
        commitMessage: row.commit_message ?? '',
        author: row.author ?? 'unknown',
        authorEmail: row.author_email ?? '',
        pushedAt: new Date(row.pushed_at).toISOString(),
        receivedAt: new Date(row.received_at).toISOString()
      },
      confidence: confidenceFromDelta(deltaMinutes),
      timeDeltaMinutes: Number(deltaMinutes.toFixed(2))
    };
  }

  async listCorrelations() {
    const result = await pool.query(
      `SELECT i.id AS incident_id,
              i.affected_service,
              i.trigger_metric,
              i.trigger_zscore,
              i.correlation_confidence,
              i.opened_at,
              d.id AS deployment_id,
              d.commit_hash,
              d.author,
              CASE WHEN d.received_at IS NULL THEN NULL
                   ELSE EXTRACT(EPOCH FROM (i.opened_at - d.received_at)) / 60 END AS delta_minutes
       FROM incidents i
       LEFT JOIN deployments d ON d.id = i.correlated_deployment_id
       ORDER BY i.opened_at DESC`
    );

    return result.rows.map((row) => ({
      incidentId: row.incident_id,
      anomalyContainerName: row.affected_service,
      anomalyMetric: row.trigger_metric ?? 'unknown',
      zscore: Number(row.trigger_zscore ?? 0),
      deploymentId: row.deployment_id ?? undefined,
      deploymentCommit: row.commit_hash ?? undefined,
      deploymentAuthor: row.author ?? undefined,
      confidence: row.correlation_confidence ?? 'NONE',
      timeDeltaMinutes:
        row.delta_minutes === null || row.delta_minutes === undefined
          ? undefined
          : Number(row.delta_minutes)
    }));
  }
}

export const correlationService = new CorrelationService();

