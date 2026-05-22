import type { Service } from '../types/service.types';
import type { Incident } from '../types/incident.types';
import type { Deployment } from '../types/deployment.types';

export const fallbackServices: Service[] = [
  {
    id: 'fallback-backend-api',
    name: 'backend-api',
    image: 'flowstate/backend',
    imageTag: 'demo',
    state: 'running',
    status: 'Fallback mode',
    createdAt: new Date().toISOString(),
    latestMetric: {
      containerId: 'fallback-backend-api',
      containerName: 'backend-api',
      cpuPercent: 32,
      memoryMb: 412,
      memoryPercent: 51,
      networkRxBytes: 14000,
      networkTxBytes: 9200,
      restartCount: 0,
      collectedAt: new Date().toISOString()
    }
  }
];

export const fallbackIncidents: Incident[] = [];
export const fallbackDeployments: Deployment[] = [];

