import { Router } from 'express';
import { getDeployment, listDeployments } from '../controllers/deployments.controller.js';

export const deploymentsRouter = Router();
deploymentsRouter.get('/', listDeployments);
deploymentsRouter.get('/:id', getDeployment);

