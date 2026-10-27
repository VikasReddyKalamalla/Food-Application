import { verifyAccessToken } from '../utils/token.util.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';
import { ACCOUNT_STATUS } from '../constants/roles.js';
import { ERROR_CODES } from '../constants/http-status.js';

/**
 * Authentication middleware that validates incoming JWT access tokens
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new UnauthorizedError(
        'Authentication required: Bearer access token missing',
        ERROR_CODES.UNAUTHORIZED
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    // Check account status if present on token payload
    if (decoded.status && decoded.status !== ACCOUNT_STATUS.ACTIVE) {
      return next(
        new ForbiddenError(
          `Account is ${decoded.status.toLowerCase()}. Access denied.`,
          ERROR_CODES.ACCOUNT_INACTIVE
        )
      );
    }

    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      status: decoded.status || ACCOUNT_STATUS.ACTIVE,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
