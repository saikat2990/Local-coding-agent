// Operational error with an HTTP status code. Throw this from services
// and the error handler middleware will turn it into a JSON response.
export class AppError extends Error {
  statusCode: number;
  details?: string[];

  constructor(message: string, statusCode = 500, details?: string[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundError(message = 'Resource not found'): AppError {
  return new AppError(message, 404);
}

export function badRequestError(message = 'Bad request', details?: string[]): AppError {
  return new AppError(message, 400, details);
}

export function conflictError(message = 'Conflict'): AppError {
  return new AppError(message, 409);
}
