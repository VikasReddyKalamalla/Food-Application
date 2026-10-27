import pino from 'pino';
import env from './env.js';

// Sensitive fields to redact from logs
export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-refresh-token"]',
  'body.password',
  'body.confirmPassword',
  'body.currentPassword',
  'body.newPassword',
  'body.token',
  'body.refreshToken',
  'body.accessToken',
  'body.cardNumber',
  'body.card_number',
  'body.cvv',
  'body.cvc',
  'body.otp',
  'body.secret',
  'body.keySecret',
  'body.webhookSecret',
];

const pinoOptions = {
  level: env.LOG_LEVEL || 'info',
  redact: {
    paths: REDACTED_PATHS,
    censor: '[REDACTED]',
  },
  base: {
    service: 'food-delivery-api',
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Use pino-pretty in development if not in test
let transport;
if (env.isDevelopment) {
  transport = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  });
}

export const logger = transport ? pino(pinoOptions, transport) : pino(pinoOptions);
export default logger;
