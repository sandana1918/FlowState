import type { Request, Response } from 'express';
import { dockerService } from '../services/docker.service.js';
import { checkDbConnection } from '../db/client.js';
import { redis } from '../cache/redis.js';
import { env } from '../config/env.js';

export const getHealth = async (_request: Request, response: Response) => {
  const [dockerConnected, dbConnected] = await Promise.all([
    dockerService.isAvailable(),
    checkDbConnection().catch(() => false)
  ]);

  response.json({
    mode: dockerConnected ? 'real' : 'fallback',
    warning: dockerConnected ? undefined : 'Docker Engine not reachable',
    data: {
      dockerConnected,
      dbConnected,
      redisConnected: redis.status === 'ready',
      githubWebhookConfigured: env.GITHUB_WEBHOOK_SECRET !== 'your_webhook_secret_here',
      config: {
        anomalyThreshold: env.ANOMALY_ZSCORE_THRESHOLD,
        anomalyWindowSize: env.ANOMALY_WINDOW_SIZE,
        correlationWindowMinutes: env.CORRELATION_WINDOW_MINUTES,
        metricCollectionInterval: env.METRIC_COLLECTION_INTERVAL,
        serviceGraphPath: env.SERVICE_GRAPH_ABSOLUTE_PATH
      }
    },
    timestamp: new Date().toISOString()
  });
};

