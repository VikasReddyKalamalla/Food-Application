import { ForbiddenError, UnauthorizedError } from '../errors/index.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * @param {...string} allowedRoles - Array of roles permitted to access this endpoint
 */
export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required before authorization'));
  }

  if (allowedRoles.length === 0) {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(
      new ForbiddenError(
        `Forbidden: Role '${req.user.role}' lacks permission for this resource`
      )
    );
  }

  next();
};

export default authorize;
