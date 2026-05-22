import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type { Service } from '../types/service.types';
import type { ContainerMetric } from '../types/metric.types';

export const servicesApi = {
  list: async () => (await api.get<ApiResponse<Service[]>>('/api/services')).data,
  metrics: async (id: string) =>
    (await api.get<ApiResponse<ContainerMetric[]>>(`/api/services/${id}/metrics`)).data,
  logs: async (id: string, tail = 100) =>
    (await api.get<ApiResponse<unknown[]>>(`/api/services/${id}/logs?tail=${tail}`)).data
};

