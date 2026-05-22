import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from './client.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  const migrationsPath = path.resolve(process.cwd(), 'src/db/migrations');
  const files = (await fs.readdir(migrationsPath))
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right));

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsPath, file), 'utf8');
    await pool.query(sql);
  }
  logger.info('Database migration complete');
  await pool.end();
};

run().catch(async (error) => {
  logger.error('Migration failed', { error: error.message });
  await pool.end();
  process.exit(1);
});
