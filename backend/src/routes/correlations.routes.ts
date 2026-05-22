import { Router } from 'express';
import { correlationService } from '../services/correlation.service.js';
import { incidentService } from '../services/incident.service.js';

export const correlationsRouter = Router();

correlationsRouter.get('/', async (_request, response) => {
  const data = await correlationService.listCorrelations();
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
});

correlationsRouter.get('/:incidentId', async (request, response) => {
  const incident = await incidentService.getIncident(request.params.incidentId);
  response.json({
    mode: 'real',
    data: incident,
    timestamp: new Date().toISOString()
  });
});

