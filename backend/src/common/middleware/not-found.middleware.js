import { NotFoundError } from '../errors/index.js';

/**
 * Catches all unhandled routes and forwards a NotFoundError to the centralized error handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const notFoundMiddleware = (req, res, next) => {
  next(
    new NotFoundError(
      `Cannot ${req.method} ${req.originalUrl} - endpoint does not exist on this server`
    )
  );
};

export default notFoundMiddleware;
