import type { Deployment } from './deployment.types';

export interface TimelineEvent {
  time: string;
  event: string;
  type: 'deployment' | 'anomaly' | 'incident' | 'blast_radius';
}

export interface BlastRadius {
  affectedService: string;
  directDependents: string[];
  indirectDependents: string[];
  totalAffectedCount: number;
}

export interface Incident {
  id?: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  affectedService: string;
  affectedContainerId?: string;
  triggerMetric?: string;
  triggerValue?: number;
  triggerZscore?: number;
  correlatedDeploymentId?: string | null;
  correlationConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  blastRadius: BlastRadius;
  timeline: TimelineEvent[];
  resolutionSteps: string[];
  openedAt: string;
  resolvedAt?: string | null;
  updatedAt?: string;
  correlatedDeployment?: Deployment | null;
}

export interface CorrelationRow {
  incidentId: string;
  anomalyContainerName: string;
  anomalyMetric: string;
  zscore: number;
  deploymentId?: string;
  deploymentCommit?: string;
  deploymentAuthor?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  timeDeltaMinutes?: number;
}

