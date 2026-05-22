import { Router } from 'express';
import {
  getCurrentMetrics,
  getMetricAnomalies,
  getMetricHistory
} from '../controllers/metrics.controller.js';

export const metricsRouter = Router();
metricsRouter.get('/current', getCurrentMetrics);
metricsRouter.get('/history', getMetricHistory);
metricsRouter.get('/service/:id/anomalies', getMetricAnomalies);

