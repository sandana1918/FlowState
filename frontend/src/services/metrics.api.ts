import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type { ContainerMetric, Anomaly } from '../types/metric.types';

export const metricsApi = {
  current: async () => (await api.get<ApiResponse<ContainerMetric[]>>('/api/metrics/current')).data,
  overview: async (minutes = 30) =>
    (
      await api.get<ApiResponse<ContainerMetric[]>>(
        `/api/metrics/overview?minutes=${minutes}`
      )
    ).data,
  history: async (containerId: string, minutes = 60) =>
    (
      await api.get<ApiResponse<ContainerMetric[]>>(
        `/api/metrics/history?containerId=${containerId}&minutes=${minutes}`
      )
    ).data,
  anomalies: async (containerId: string) =>
    (await api.get<ApiResponse<Anomaly[]>>(`/api/metrics/service/${containerId}/anomalies`)).data
};
