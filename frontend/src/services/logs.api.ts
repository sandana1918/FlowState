import { api } from './api';
import type { ApiResponse } from '../types/api.types';

export interface LogLine {
  raw: string;
  timestamp?: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

export const logsApi = {
  list: async (containerId: string, tail = 100) =>
    (await api.get<ApiResponse<LogLine[]>>(`/api/logs/${containerId}?tail=${tail}`)).data
};

