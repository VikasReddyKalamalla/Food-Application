import crypto from 'node:crypto';

/**
 * Middleware to generate or propagate unique Request ID for distributed tracing
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requestIdMiddleware = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const requestId = existingId && typeof existingId === 'string' ? existingId : crypto.randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

export default requestIdMiddleware;
