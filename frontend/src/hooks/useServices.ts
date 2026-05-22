import { useEffect, useState } from 'react';
import { servicesApi } from '../services/services.api';
import { metricsApi } from '../services/metrics.api';
import type { Service } from '../types/service.types';
import type { Mode } from '../types/api.types';
import type { ContainerMetric } from '../types/metric.types';

const buildFallbackServices = (metrics: ContainerMetric[]): Service[] =>
  metrics.map((metric) => ({
    id: metric.containerId,
    name: metric.containerName,
    image: 'unknown',
    imageTag: 'latest',
    state: 'running',
    status: 'Metrics fallback',
    createdAt: metric.collectedAt,
    latestMetric: metric
  }));

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [mode, setMode] = useState<Mode>('real');
  const [warning, setWarning] = useState<string>();

  useEffect(() => {
    void servicesApi
      .list()
      .then((result) => {
        setServices(result.data);
        setMode(result.mode);
        setWarning(result.warning);
      })
      .catch(async () => {
        const result = await metricsApi.current();
        setServices(buildFallbackServices(result.data));
        setMode('fallback');
        setWarning('Service discovery is unavailable. Showing recent metric sources.');
      });
  }, []);

  return { services, mode, warning, setServices };
};
