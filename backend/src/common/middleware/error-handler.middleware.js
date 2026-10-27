import { ZodError } from 'zod';
import logger from '../../config/logger.js';
import env from '../../config/env.js';
import { AppError } from '../errors/app-error.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.js';

/**
 * Centralized Application Error Handling Middleware
 * Ensures safe, structured, and consistent error responses without exposing internal secrets or stack traces.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let code = ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected internal error occurred';
  let details = [];

  // Log error with request tracking ID
  logger.error(
    {
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      errorName: err.name,
      errorMessage: err.message,
      ...(env.isDevelopment && { stack: err.stack }),
    },
    'Handled exception in request cycle'
  );

  // 1. Domain AppErrors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details || [];
  }
  // 2. Direct Zod Validation Errors
  else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    code = ERROR_CODES.VALIDATION_ERROR;
    message = 'Request validation failed';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // 3. Body-parser JSON syntax error
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = ERROR_CODES.BAD_REQUEST;
    message = 'Malformed JSON syntax in request body';
    details = [{ message: 'Please ensure request body is well-formed JSON' }];
  }
  // 4. CORS Error
  else if (err.message && err.message.startsWith('CORS Error:')) {
    statusCode = HTTP_STATUS.FORBIDDEN;
    code = ERROR_CODES.FORBIDDEN;
    message = err.message;
  }
  // 5. Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    code = ERROR_CODES.BAD_REQUEST;
    message = `Invalid format for field '${err.path}'`;
    details = [{ path: err.path, value: err.value }];
  }
  // 6. Unknown / Unhandled Exception
  else {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    code = ERROR_CODES.INTERNAL_SERVER_ERROR;

    if (env.isDevelopment) {
      message = err.message || message;
      details = [{ stack: err.stack }];
    } else {
      message = 'An internal server error occurred. Please contact support.';
      details = [];
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
  });
};

export default errorHandlerMiddleware;
