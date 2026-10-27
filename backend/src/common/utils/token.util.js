import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import { UnauthorizedError } from '../errors/index.js';
import { ERROR_CODES } from '../constants/http-status.js';

/**
 * Signs a JWT access token
 * @param {object} payload
 * @param {string} [expiresIn]
 * @returns {string}
 */
export const generateAccessToken = (payload, expiresIn = env.JWT_ACCESS_EXPIRES_IN) => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn,
      issuer: 'food-delivery-api',
    }
  );
};

/**
 * Signs a JWT refresh token with unique jti for rotation tracking
 * @param {object} payload
 * @param {string} [expiresIn]
 * @returns {string}
 */
export const generateRefreshToken = (payload, expiresIn = env.JWT_REFRESH_EXPIRES_IN) => {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn,
      issuer: 'food-delivery-api',
    }
  );
};

/**
 * Verifies and decodes a JWT access token
 * @param {string} token
 * @returns {object}
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'food-delivery-api',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired', ERROR_CODES.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid access token', ERROR_CODES.INVALID_TOKEN);
  }
};

/**
 * Verifies and decodes a JWT refresh token
 * @param {string} token
 * @returns {object}
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'food-delivery-api',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Refresh token has expired', ERROR_CODES.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid refresh token', ERROR_CODES.INVALID_TOKEN);
  }
};

/**
 * Creates a SHA-256 hash of a token for secure storage
 * Raw refresh tokens should NEVER be stored in databases.
 * @param {string} token
 * @returns {string}
 */
export const hashToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a valid string');
  }
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
