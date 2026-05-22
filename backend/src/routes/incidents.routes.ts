import { Router } from 'express';
import {
  getIncident,
  listIncidents,
  updateIncidentStatus
} from '../controllers/incidents.controller.js';

export const incidentsRouter = Router();
incidentsRouter.get('/', listIncidents);
incidentsRouter.get('/:id', getIncident);
incidentsRouter.patch('/:id/status', updateIncidentStatus);

