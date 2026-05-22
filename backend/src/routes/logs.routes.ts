import { Router } from 'express';
import { getServiceLogs } from '../controllers/services.controller.js';

export const logsRouter = Router();
logsRouter.get('/:id', getServiceLogs);

