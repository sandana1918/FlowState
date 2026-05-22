import type { Request, Response } from 'express';
import { incidentService } from '../services/incident.service.js';
import { z } from 'zod';

export const listIncidents = async (request: Request, response: Response) => {
  const status = request.query.status ? String(request.query.status) : undefined;
  const data = await incidentService.listIncidents(status as never);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const getIncident = async (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const data = await incidentService.getIncident(id);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

export const updateIncidentStatus = async (request: Request, response: Response) => {
  const schema = z.object({
    status: z.enum(['open', 'investigating', 'resolved'])
  });
  const body = schema.parse(request.body);
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const data = await incidentService.updateStatus(id, body.status);
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};
