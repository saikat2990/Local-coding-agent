import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface ErrorBody {
  error: { message: string; details?: string[] };
}

// Must keep 4 parameters so Express recognises it as an error handler.
export function errorHandler(
  err: Error & { type?: string },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'Invalid JSON body' } });
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack });
  }

  const body: ErrorBody = {
    error: { message: statusCode >= 500 ? 'Internal server error' : err.message },
  };
  if (err instanceof AppError && err.details) body.error.details = err.details;

  res.status(statusCode).json(body);
}
