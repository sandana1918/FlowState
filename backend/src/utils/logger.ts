type LogMeta = Record<string, unknown>;

const write = (level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: LogMeta) => {
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  const line = `[${new Date().toISOString()}] [${level}] ${message}${payload}`;
  if (level === 'ERROR') {
    console.error(line);
    return;
  }
  if (level === 'WARN') {
    console.warn(line);
    return;
  }
  console.info(line);
};

export const logger = {
  info: (message: string, meta?: LogMeta) => write('INFO', message, meta),
  warn: (message: string, meta?: LogMeta) => write('WARN', message, meta),
  error: (message: string, meta?: LogMeta) => write('ERROR', message, meta)
};

