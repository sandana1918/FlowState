import { dockerService } from './docker.service.js';
import { metricsService } from './metrics.service.js';

export class ServicesService {
  async listServices() {
    const containersResult = await dockerService.listContainers();
    const currentMetrics = await metricsService.getCurrentMetrics();
    const metricsMap = new Map(currentMetrics.map((metric) => [metric.containerId, metric]));

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

