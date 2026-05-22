import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from './client.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  const sqlPath = path.resolve(process.cwd(), 'src/db/migrations/001_initial.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  await pool.query(sql);
  logger.info('Database migration complete');
  await pool.end();
};

run().catch(async (error) => {
  logger.error('Migration failed', { error: error.message });
  await pool.end();
  process.exit(1);
});

