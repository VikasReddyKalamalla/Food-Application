import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.js';

export class AppError extends Error {
  /**
   * @param {string} message - Human-readable safe error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {string} [code=ERROR_CODES.INTERNAL_SERVER_ERROR] - Machine-readable error code
   * @param {Array<object>} [details=[]] - Optional structured error details
   * @param {boolean} [isOperational=true] - Indicates if error is an expected domain/operational error
   */
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code = ERROR_CODES.INTERNAL_SERVER_ERROR,
    details = [],
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
