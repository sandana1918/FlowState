import type { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service.js';
import { webhookSignatureFailuresTotal } from '../monitoring/prometheus.js';

export const handleGithubWebhook = async (request: Request, response: Response) => {
  const signature = request.header('x-hub-signature-256');
  const event = request.header('x-github-event') ?? 'unknown';
  const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from(JSON.stringify(request.body));
  if (!webhookService.verifySignature(signature, rawBody)) {
    webhookSignatureFailuresTotal.inc();
    response.status(401).json({
      mode: 'fallback',
      warning: 'Invalid webhook signature',
      data: null,
      timestamp: new Date().toISOString()
    });
    return;
  }

  const payload = JSON.parse(rawBody.toString('utf8')) as unknown;
  if (event !== 'push' || !webhookService.isPushPayload(payload)) {
    response.status(202).json({
      mode: 'real',
      data: {
        ignored: true,
        event
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  const data = await webhookService.storePushEvent(payload);
  response.status(201).json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
};
