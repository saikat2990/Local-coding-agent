import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

type AsyncRequestHandler<P> = (req: Request<P>, res: Response, next: NextFunction) => Promise<unknown>;

// Wraps an async route handler so rejected promises reach the error middleware.
export function asyncHandler<P = ParamsDictionary>(fn: AsyncRequestHandler<P>): RequestHandler<P> {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
