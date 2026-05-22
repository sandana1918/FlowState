import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('postgresql://flowstate:flowstate@localhost:5432/flowstate'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DOCKER_SOCKET_PATH: z.string().default('//./pipe/docker_engine'),
  GITHUB_WEBHOOK_SECRET: z.string().default('your_webhook_secret_here'),
  ANOMALY_ZSCORE_THRESHOLD: z.coerce.number().default(2.5),
  ANOMALY_WINDOW_SIZE: z.coerce.number().default(20),
  CORRELATION_WINDOW_MINUTES: z.coerce.number().default(30),
  METRIC_COLLECTION_INTERVAL: z.coerce.number().default(15),
  SERVICE_GRAPH_PATH: z.string().default('./service-dependencies.json'),
  PROMETHEUS_URL: z.string().optional().default('')
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  SERVICE_GRAPH_ABSOLUTE_PATH: path.resolve(process.cwd(), parsed.SERVICE_GRAPH_PATH)
};

