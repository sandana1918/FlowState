import { Router } from 'express';
import {
  getServiceInspect,
  getServiceLogs,
  getServiceMetrics,
  listServices
} from '../controllers/services.controller.js';

export const servicesRouter = Router();
servicesRouter.get('/', listServices);
servicesRouter.get('/:id/metrics', getServiceMetrics);
servicesRouter.get('/:id/logs', getServiceLogs);
servicesRouter.get('/:id', getServiceInspect);

