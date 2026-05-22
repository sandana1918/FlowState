import type { Request, Response } from 'express';
import { servicesService } from '../services/services.service.js';
import { metricsService } from '../services/metrics.service.js';
import { logsService } from '../services/logs.service.js';
import { dockerService } from '../services/docker.service.js';

export const listServices = async (_request: Request, response: Response) => {
  const result = await servicesService.listServices();
  response.json({
    ...result,
    timestamp: new Date().toISOString()
  });
};

export const getServiceMetrics = async (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const data = await metricsService.getServiceMetrics(id);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const getServiceLogs = async (request: Request, response: Response) => {
  const tail = Number(request.query.tail ?? 100);
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const data = await logsService.getLogs(id, tail);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const getServiceInspect = async (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const data = await dockerService.inspectContainer(id);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};
