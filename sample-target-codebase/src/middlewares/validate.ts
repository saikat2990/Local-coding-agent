import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { badRequestError } from '../utils/AppError';
import type { Validator } from '../types/validation';

// Runs a validator against req.body and forwards a 400 if it reports errors.
export function validate(validator: Validator): RequestHandler {
  return function validateMiddleware(req: Request, _res: Response, next: NextFunction) {
    const errors = validator(req.body || {});
    if (errors.length > 0) {
      return next(badRequestError('Validation failed', errors));
    }
    next();
  };
}
