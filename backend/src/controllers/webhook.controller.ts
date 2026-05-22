import type { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service.js';

export const handleGithubWebhook = async (request: Request, response: Response) => {
  const signature = request.header('x-hub-signature-256');
  const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body));
  if (!webhookService.verifySignature(signature, rawBody)) {
    response.status(401).json({
      mode: 'fallback',
      warning: 'Invalid webhook signature',
      data: null,
      timestamp: new Date().toISOString()
    });
    return;
  }

  const payload = JSON.parse(rawBody.toString('utf8'));
  const data = await webhookService.storePushEvent(payload);
  response.status(201).json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};

