import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validate =
  <T>(schema: ZodSchema<T>) =>
  (request: Request, response: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query
    });

    if (!parsed.success) {
      response.status(400).json({
        mode: 'fallback',
        warning: parsed.error.flatten(),
        data: null,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };

