import { HTTP_STATUS } from '../constants/http-status.js';

/**
 * Standard API Success Response Formatter
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message='Operation completed successfully']
 * @param {any} [options.data=null]
 * @param {object|null} [options.meta=null]
 */
export const sendSuccess = (
  res,
  { statusCode = HTTP_STATUS.OK, message = 'Operation completed successfully', data = {}, meta } = {}
) => {
  const responseBody = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined && meta !== null) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
};

/**
 * Standard API Error Response Formatter
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message='An error occurred']
 * @param {string} [options.code='INTERNAL_SERVER_ERROR']
 * @param {Array} [options.details=[]]
 */
export const sendError = (
  res,
  {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message = 'An unexpected error occurred',
    code = 'INTERNAL_SERVER_ERROR',
    details = [],
  } = {}
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
  });
};

export default {
  sendSuccess,
  sendError,
};
