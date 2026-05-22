import fs from 'node:fs/promises';
import { Router } from 'express';
import { env } from '../config/env.js';
import { loadServiceGraph } from '../utils/serviceGraph.js';
import { dockerService } from '../services/docker.service.js';
import { checkDbConnection } from '../db/client.js';
import { redis } from '../cache/redis.js';

export const settingsRouter = Router();

settingsRouter.get('/status', async (_request, response) => {
  const [dockerConnected, dockerVersion] = await Promise.all([
    dockerService.isAvailable(),
    dockerService.getVersion()
  ]);
  const dbConnected = await checkDbConnection().catch(() => false);
  response.json({
    mode: dockerConnected ? 'real' : 'fallback',
    warning: dockerConnected ? undefined : 'Docker Engine not reachable',
    data: {
      dockerConnected,
      dbConnected,
      redisConnected: redis.status === 'ready',
      githubWebhookConfigured: env.GITHUB_WEBHOOK_SECRET !== 'your_webhook_secret_here',
      dockerVersion,
      webhookUrl: 'https://your-domain.com/api/webhooks/github',
      config: {
        anomalyZScoreThreshold: env.ANOMALY_ZSCORE_THRESHOLD,
        anomalyWindowSize: env.ANOMALY_WINDOW_SIZE,
        correlationWindowMinutes: env.CORRELATION_WINDOW_MINUTES,
        metricCollectionInterval: env.METRIC_COLLECTION_INTERVAL
      }
    },
    timestamp: new Date().toISOString()
  });
});

settingsRouter.get('/service-graph', async (_request, response) => {
  const data = await loadServiceGraph();
  response.json({
    mode: 'real',
    data,
    timestamp: new Date().toISOString()
  });
});

settingsRouter.put('/service-graph', async (request, response) => {
  await fs.writeFile(env.SERVICE_GRAPH_ABSOLUTE_PATH, JSON.stringify(request.body, null, 2));
  response.json({
    mode: 'real',
    data: request.body,
    timestamp: new Date().toISOString()
  });
});
