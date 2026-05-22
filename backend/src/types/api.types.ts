export type Mode = 'real' | 'fallback';

export interface ApiResponse<T> {
  mode: Mode;
  warning?: string;
  data: T;
  timestamp: string;
}

export interface ServiceResult<T> {
  mode: Mode;
  warning?: string;
  data: T;
}

export interface ConnectionStatus {
  dockerConnected: boolean;
  dbConnected: boolean;
  redisConnected: boolean;
  githubWebhookConfigured: boolean;
}

