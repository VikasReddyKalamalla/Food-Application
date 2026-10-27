import AppError from './app-error.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.js';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = ERROR_CODES.BAD_REQUEST, details = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, code, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = ERROR_CODES.UNAUTHORIZED, details = []) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden for this role or resource', code = ERROR_CODES.FORBIDDEN, details = []) {
    super(message, HTTP_STATUS.FORBIDDEN, code, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = ERROR_CODES.NOT_FOUND, details = []) {
    super(message, HTTP_STATUS.NOT_FOUND, code, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict or state violation', code = ERROR_CODES.CONFLICT, details = []) {
    super(message, HTTP_STATUS.CONFLICT, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request validation failed', details = []) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later', details = []) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED, details);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', code = ERROR_CODES.SERVICE_UNAVAILABLE, details = []) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, code, details);
  }
}

export default {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  ServiceUnavailableError,
};
