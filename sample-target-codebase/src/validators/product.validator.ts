import type { Validator } from '../types/validation';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

export const validateCreateProduct: Validator = (body) => {
  const errors: string[] = [];
  if (!isNonEmptyString(body.name)) {
    errors.push('name is required and must be a non-empty string');
  }
  if (!isNonNegativeNumber(body.price)) {
    errors.push('price is required and must be a number >= 0');
  }
  if (body.stock !== undefined && !isNonNegativeInteger(body.stock)) {
    errors.push('stock must be an integer >= 0');
  }
  return errors;
};

export const validateUpdateProduct: Validator = (body) => {
  const errors: string[] = [];
  if (body.name === undefined && body.price === undefined && body.stock === undefined) {
    errors.push('at least one of name, price or stock must be provided');
  }
  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push('name must be a non-empty string');
  }
  if (body.price !== undefined && !isNonNegativeNumber(body.price)) {
    errors.push('price must be a number >= 0');
  }
  if (body.stock !== undefined && !isNonNegativeInteger(body.stock)) {
    errors.push('stock must be an integer >= 0');
  }
  return errors;
};
