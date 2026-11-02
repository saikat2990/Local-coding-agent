import type { NextFunction, Request, Response } from 'express';
import { notFoundError } from '../utils/AppError';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(notFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}
