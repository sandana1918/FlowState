import http from 'node:http';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import client from 'prom-client';
import { env } from './config/env.js';
import { requestLoggerMiddleware } from './middleware/requestLogger.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { healthRouter } from './routes/health.routes.js';
import { servicesRouter } from './routes/services.routes.js';
import { metricsRouter } from './routes/metrics.routes.js';
import { incidentsRouter } from './routes/incidents.routes.js';
import { deploymentsRouter } from './routes/deployments.routes.js';
import { webhookRouter } from './routes/webhook.routes.js';
import { correlationsRouter } from './routes/correlations.routes.js';
import { logsRouter } from './routes/logs.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { socketHandler } from './socket/socketHandler.js';
import { metricCollector } from './collectors/metricCollector.js';
import { connectRedis } from './cache/redis.js';
import { checkDbConnection, pool } from './db/client.js';
import { dockerService } from './services/docker.service.js';
import { logger } from './utils/logger.js';

client.collectDefaultMetrics();

const app = express();
app.use(cors());
app.use(rateLimit({ windowMs: 60_000, max: 300 }));
app.use(requestLoggerMiddleware);
app.use('/api/webhooks', webhookRouter);
app.use(express.json({ limit: '2mb' }));

app.get('/metrics', async (_request, response) => {
  response.set('Content-Type', client.register.contentType);
  response.end(await client.register.metrics());
});

app.use('/api/health', healthRouter);
app.use('/api/services', servicesRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/correlations', correlationsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/settings', settingsRouter);
app.use(errorMiddleware);

const server = http.createServer(app);
socketHandler.initialize(server);

const bootstrap = async () => {
  try {
    await Promise.all([connectRedis().catch(() => undefined), checkDbConnection()]);
    socketHandler.emitConnectionStatus({
      dockerConnected: await dockerService.isAvailable(),
      dbConnected: true,
      redisConnected: true
    });
    metricCollector.start();
    server.listen(env.PORT, () => {
      logger.info(`FlowState backend listening on ${env.PORT}`);
    });
  } catch (error) {
    logger.error('Bootstrap failed', { error: (error as Error).message });
    await pool.end();
    process.exit(1);
  }
};

void bootstrap();
