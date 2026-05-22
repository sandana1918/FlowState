import { dockerService } from './docker.service.js';
import type { ParsedLogLine } from '../types/docker.types.js';

const detectLevel = (line: string): ParsedLogLine['level'] => {
  const upper = line.toUpperCase();
  if (upper.includes('ERROR') || upper.includes('FATAL')) {
    return 'ERROR';
  }
  if (upper.includes('WARN')) {
    return 'WARN';
  }
  return 'INFO';
};

export class LogsService {
  async getLogs(containerId: string, tail = 100) {
    const lines = await dockerService.getContainerLogs(containerId, tail);
    return lines.map((raw) => {
      const match = raw.match(/^(\d{4}-\d{2}-\d{2}T[^ ]+)\s+(.*)$/);
      return {
        raw,
        timestamp: match?.[1],
        level: detectLevel(raw),
        message: match?.[2] ?? raw
      } satisfies ParsedLogLine;
    });
  }
}

export const logsService = new LogsService();

