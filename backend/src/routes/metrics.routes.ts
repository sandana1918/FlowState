import { Router } from 'express';
import {
  getCurrentMetrics,
  getDashboardHistory,
  getMetricAnomalies,
  getMetricHistory
} from '../controllers/metrics.controller.js';

export const metricsRouter = Router();
metricsRouter.get('/current', getCurrentMetrics);
metricsRouter.get('/overview', getDashboardHistory);
metricsRouter.get('/history', getMetricHistory);
metricsRouter.get('/service/:id/anomalies', getMetricAnomalies);
