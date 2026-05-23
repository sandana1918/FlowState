import { Pool } from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 3_000,
  query_timeout: 5_000,
  idleTimeoutMillis: 10_000,
  max: 10
});

pool.on('error', (error) => {
  logger.error('PostgreSQL pool error', { error: error.message });
});

export const checkDbConnection = async () => {
  const client = await Promise.race([
    pool.connect(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timed out')), 3_000);
    })
  ]);
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
};
