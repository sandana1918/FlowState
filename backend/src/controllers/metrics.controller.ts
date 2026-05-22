import type { Request, Response } from 'express';
import { metricsService } from '../services/metrics.service.js';

export const getCurrentMetrics = async (_request: Request, response: Response) => {
  const data = await metricsService.getCurrentMetrics();
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const getMetricHistory = async (request: Request, response: Response) => {
  const minutes = Number(request.query.minutes ?? 60);
  const containerId = String(request.query.containerId ?? '');
  const data = await metricsService.getMetricHistory(containerId, minutes);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const getDashboardHistory = async (request: Request, response: Response) => {
  const minutes = Number(request.query.minutes ?? 30);
  const data = await metricsService.getDashboardHistory(minutes);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const getMetricAnomalies = async (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const data = await metricsService.getAnomaliesForContainer(id);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};
