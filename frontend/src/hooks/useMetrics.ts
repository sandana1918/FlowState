import { useEffect, useState } from 'react';
import { metricsApi } from '../services/metrics.api';
import type { ContainerMetric, Anomaly } from '../types/metric.types';

export const useMetrics = (containerId?: string, minutes = 60) => {
  const [metrics, setMetrics] = useState<ContainerMetric[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    if (!containerId) {
      return;
    }
    void metricsApi.history(containerId, minutes).then((result) => setMetrics(result.data));
    void metricsApi.anomalies(containerId).then((result) => setAnomalies(result.data));
  }, [containerId, minutes]);

  return { metrics, anomalies };
};

