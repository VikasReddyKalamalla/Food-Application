import pinoHttp from 'pino-http';
import logger, { REDACTED_PATHS } from '../../config/logger.js';
import env from '../../config/env.js';

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id || req.headers['x-request-id'],
  autoLogging: {
    ignore: (req) => {
      // Avoid log spam for routine health/ready probes in development and tests
      if (env.isTest) return true;
      return req.url === '/health' || req.url === '/ready';
    },
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} -> ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
  },
  redact: {
    paths: REDACTED_PATHS,
    censor: '[REDACTED]',
  },
});

export default httpLogger;
