import { ValidationError } from '../errors/index.js';

/**
 * Higher-order middleware to validate request components against Zod schemas
 * @param {object} schemas
 * @param {import('zod').ZodSchema} [schemas.body]
 * @param {import('zod').ZodSchema} [schemas.query]
 * @param {import('zod').ZodSchema} [schemas.params]
 * @param {import('zod').ZodSchema} [schemas.headers]
 */
export const validate = (schemas = {}) => (req, res, next) => {
  try {
    const details = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            location: 'params',
            field: err.path.join('.'),
            message: err.message,
          });
        });
      } else {
        req.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            location: 'query',
            field: err.path.join('.'),
            message: err.message,
          });
        });
      } else {
        req.query = result.data;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            location: 'body',
            field: err.path.join('.'),
            message: err.message,
          });
        });
      } else {
        req.body = result.data;
      }
    }

    if (schemas.headers) {
      const result = schemas.headers.safeParse(req.headers);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            location: 'headers',
            field: err.path.join('.'),
            message: err.message,
          });
        });
      }
    }

    if (details.length > 0) {
      return next(new ValidationError('Request validation failed', details));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
