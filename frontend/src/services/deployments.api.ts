import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type { Deployment } from '../types/deployment.types';
import type { CorrelationRow } from '../types/incident.types';

export const deploymentsApi = {
  list: async () => (await api.get<ApiResponse<Deployment[]>>('/api/deployments')).data,
  correlations: async () =>
    (await api.get<ApiResponse<CorrelationRow[]>>('/api/correlations')).data,
  health: async () => (await api.get<ApiResponse<any>>('/api/health')).data,
  settings: async () => (await api.get<ApiResponse<any>>('/api/settings/status')).data,
  serviceGraph: async () => (await api.get<ApiResponse<Record<string, string[]>>>('/api/settings/service-graph')).data,
  saveServiceGraph: async (graph: Record<string, string[]>) =>
    (await api.put<ApiResponse<Record<string, string[]>>>('/api/settings/service-graph', graph)).data
};

