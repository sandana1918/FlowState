import { dockerService } from './docker.service.js';
import { metricsService } from './metrics.service.js';
import type { ContainerSummary } from '../types/docker.types.js';
import { logger } from '../utils/logger.js';

export class ServicesService {
  private buildMetricFallbackServices() {
    return async (): Promise<ContainerSummary[]> => {
      const currentMetrics = await metricsService.getCurrentMetrics();
      const seen = new Set<string>();
      return currentMetrics
        .filter((metric) => {
          if (seen.has(metric.containerId)) {
            return false;
          }
          seen.add(metric.containerId);
          return true;
        })
        .map((metric) => ({
          id: metric.containerId,
          name: metric.containerName,
          image: 'unknown',
          imageTag: 'latest',
          state: 'running',
          status: 'Metrics fallback',
          createdAt: metric.collectedAt
        }));
    };
  }

  async listServices() {
    const currentMetrics = await metricsService.getCurrentMetrics().catch((error: Error) => {
      logger.warn('Failed to load current metrics for service listing', { error: error.message });
      return [];
    });
    const metricsMap = new Map(currentMetrics.map((metric) => [metric.containerId, metric]));
    const containersResult = await dockerService.listContainers();

    if (containersResult.mode === 'fallback' && currentMetrics.length > 0) {
      const metricFallbackServices = await this.buildMetricFallbackServices()();
      return {
        mode: 'fallback' as const,
        warning: containersResult.warning ?? 'Docker service discovery unavailable. Showing recent metric sources.',
        data: metricFallbackServices.map((container) => ({
          ...container,
          latestMetric: metricsMap.get(container.id) ?? null
        }))
      };
    }

    return {
      ...containersResult,
      data: containersResult.data.map((container) => ({
        ...container,
        latestMetric: metricsMap.get(container.id) ?? null
      }))
    };
  }
}

export const servicesService = new ServicesService();
