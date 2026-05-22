import type { AnomalyRecord } from '../types/metric.types.js';
import type { DeploymentRecord } from '../types/incident.types.js';

export class ResolutionService {
  generate(anomaly: AnomalyRecord, deployment?: DeploymentRecord | null, restartCount?: number) {
    const commitHash = deployment?.commitHash ?? 'unknown-commit';
    const author = deployment?.author ?? 'unknown-author';
    const containerName = anomaly.containerName;

    if (restartCount && restartCount > 0) {
      return [
        'Container is crash-looping',
        `Check logs immediately: docker logs ${containerName} --tail 100`,
        `Review recent commit ${commitHash} for unhandled exceptions`,
        'Check environment variables and secrets are properly configured'
      ];
    }

    if (anomaly.metricName === 'cpu_percent' && anomaly.zscore > 3) {
      return [
        'Check for infinite loops or blocking operations in recent commits',
        `Review the commit: ${commitHash} by ${author}`,
        `Consider rolling back deployment with: docker compose up --scale ${containerName}=0 && git revert ${commitHash}`,
        'Check container resource limits in docker-compose.yml',
        'Monitor for 5 minutes to see if it self-resolves'
      ];
    }

    if (anomaly.metricName === 'memory_percent' && anomaly.metricValue > 85) {
      return [
        'Likely memory leak introduced in recent deployment',
        `Review ${commitHash} for unbounded caches, growing arrays, or missing cleanup`,
        `Restart the container immediately if memory > 95%: docker restart ${containerName}`,
        'Check for large response bodies being held in memory'
      ];
    }

    return [
      `Inspect recent changes around ${commitHash}`,
      `Review runtime health for ${containerName}`,
      'Compare current behavior with baseline metrics',
      'Watch the service for 5 minutes before escalating'
    ];
  }
}

export const resolutionService = new ResolutionService();

