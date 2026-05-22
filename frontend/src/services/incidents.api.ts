import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type { Incident } from '../types/incident.types';

export const incidentsApi = {
  list: async () => (await api.get<ApiResponse<Incident[]>>('/api/incidents')).data,
  get: async (id: string) => (await api.get<ApiResponse<Incident>>(`/api/incidents/${id}`)).data,
  updateStatus: async (id: string, status: Incident['status']) =>
    (await api.patch<ApiResponse<Incident>>(`/api/incidents/${id}/status`, { status })).data
};

