export type Mode = 'real' | 'fallback';

export interface ApiResponse<T> {
  mode: Mode;
  warning?: string;
  data: T;
  timestamp: string;
}

