import rateLimit from 'express-rate-limit';
import env from '../../config/env.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/http-status.js';

export const rateLimitHandler = (req, res) => {
  return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'Too many requests from this client, please try again later',
    code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    details: [
      {
        retryAfterSeconds: Math.ceil(
          (req.rateLimit?.resetTime?.getTime() - Date.now()) / 1000
        ) || 60,
      },
    ],
  });
};

/**
 * General API Rate Limiter
 * 300 requests per 15-minute window in production
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.isTest && process.env.SKIP_RATE_LIMIT === 'true',
});

/**
 * Strict Rate Limiter for Authentication & Sensitive Endpoints
 * 20 attempts per 15-minute window
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: () => env.isTest && process.env.SKIP_RATE_LIMIT === 'true',
});

/**
 * Creates a rate limiter instance with custom options
 * @param {import('express-rate-limit').Options} [customOptions]
 */
export const createRateLimiter = (customOptions = {}) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    ...customOptions,
  });
};

export default {
  apiRateLimiter,
  authRateLimiter,
  createRateLimiter,
  rateLimitHandler,
};
