import { create } from 'zustand';
import type { Mode } from '../types/api.types';
import type { ContainerMetric, Anomaly } from '../types/metric.types';
import type { Incident } from '../types/incident.types';
import type { Deployment } from '../types/deployment.types';

interface SocketState {
  connected: boolean;
  mode: Mode;
  warning?: string;
  metrics: ContainerMetric[];
  anomalies: Anomaly[];
  incidents: Incident[];
  deployments: Deployment[];
  setConnected: (connected: boolean) => void;
  setMetrics: (mode: Mode, metrics: ContainerMetric[], warning?: string) => void;
  pushAnomaly: (anomaly: Anomaly) => void;
  pushIncident: (incident: Incident) => void;
  updateIncident: (incident: Incident) => void;
  pushDeployment: (deployment: Deployment) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  mode: 'real',
  warning: undefined,
  metrics: [],
  anomalies: [],
  incidents: [],
  deployments: [],
  setConnected: (connected) => set({ connected }),
  setMetrics: (mode, metrics, warning) => set({ mode, metrics, warning }),
  pushAnomaly: (anomaly) => set((state) => ({ anomalies: [anomaly, ...state.anomalies].slice(0, 100) })),
  pushIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents.filter((item) => item.id !== incident.id)] })),
  updateIncident: (incident) =>
    set((state) => ({
      incidents: state.incidents.map((item) => (item.id === incident.id ? incident : item))
    })),
  pushDeployment: (deployment) =>
    set((state) => ({
      deployments: [deployment, ...state.deployments.filter((item) => item.id !== deployment.id)].slice(0, 100)
    }))
}));

