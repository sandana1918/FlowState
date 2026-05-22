export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type CorrelationConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface DeploymentRecord {
  id?: string;
  repo: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  authorEmail: string;
  avatarUrl?: string;
  pushedAt: string;
  receivedAt?: string;
}

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

export interface IncidentRecord {
  id?: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedService: string;
  affectedContainerId?: string;
  triggerMetric?: string;
  triggerValue?: number;
  triggerZscore?: number;
  correlatedDeploymentId?: string | null;
  correlationConfidence: CorrelationConfidence;
  blastRadius: BlastRadius;
  timeline: TimelineEvent[];
  resolutionSteps: string[];
  openedAt: string;
  resolvedAt?: string | null;
  updatedAt?: string;
  correlatedDeployment?: DeploymentRecord | null;
}

export interface CorrelationRecord {
  incidentId: string;
  anomalyContainerName: string;
  anomalyMetric: string;
  zscore: number;
  incidentOpenedAt?: string;
  deploymentId?: string;
  deploymentRepo?: string;
  deploymentBranch?: string;
  deploymentCommit?: string;
  deploymentAuthor?: string;
  deploymentReceivedAt?: string;
  confidence: CorrelationConfidence;
  timeDeltaMinutes?: number;
}
