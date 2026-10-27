import env from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, postman, server-to-server) with no origin
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = env.parsedClientUrls;
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    return callback(new Error(`CORS Error: Origin '${origin}' is not in the allowed list.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'Idempotency-Key',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours preflight cache
};

export default corsOptions;
