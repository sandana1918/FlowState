import { spawn } from 'node:child_process';

const runMigrations = async () =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, ['dist/db/runMigration.js'], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Migration exited with code ${code ?? 'unknown'}`));
    });
  });

const bootstrap = async () => {
  await runMigrations();
  await import('./server.js');
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
