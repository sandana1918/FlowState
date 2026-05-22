import { useEffect, useState } from 'react';
import { logsApi, type LogLine } from '../services/logs.api';

export const useLogs = (containerId?: string, tail = 100) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  useEffect(() => {
    if (!containerId) {
      return;
    }
    void logsApi
      .list(containerId, tail)
      .then((result) => setLogs(result.data))
      .catch(() => setLogs([]));
  }, [containerId, tail]);
  return { logs };
};
