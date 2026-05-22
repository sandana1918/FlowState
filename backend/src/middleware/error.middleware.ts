import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export const errorMiddleware = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  logger.error('Unhandled request error', { error: error.message });
  response.status(500).json({
    mode: 'fallback',
    warning: error.message,
    data: null,
    timestamp: new Date().toISOString()
  });
};

