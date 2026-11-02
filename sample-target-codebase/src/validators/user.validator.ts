import type { Validator } from '../types/validation';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && EMAIL_PATTERN.test(value);
}

export const validateCreateUser: Validator = (body) => {
  const errors: string[] = [];
  if (!isNonEmptyString(body.name)) {
    errors.push('name is required and must be a non-empty string');
  }
  if (!isEmail(body.email)) {
    errors.push('email is required and must be a valid email address');
  }
  return errors;
};

export const validateUpdateUser: Validator = (body) => {
  const errors: string[] = [];
  if (body.name === undefined && body.email === undefined) {
    errors.push('at least one of name or email must be provided');
  }
  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push('name must be a non-empty string');
  }
  if (body.email !== undefined && !isEmail(body.email)) {
    errors.push('email must be a valid email address');
  }
  return errors;
};
