import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI cannot be empty')
    .refine(
      (val) => val.startsWith('mongodb://') || val.startsWith('mongodb+srv://'),
      { message: 'MONGODB_URI must start with mongodb:// or mongodb+srv://' }
    ),
  CLIENT_URL: z
    .string()
    .default('http://localhost:3000,http://localhost:5173'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECURE: z
    .preprocess((val) => {
      if (typeof val === 'string') return val.toLowerCase() === 'true';
      return Boolean(val);
    }, z.boolean())
    .default(false),
  COOKIE_SAME_SITE: z
    .enum(['lax', 'strict', 'none'])
    .default('lax'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  // Optional AI Provider Integration
  AI_PROVIDER: z.enum(['mock', 'gemini', 'openai']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default('gemini-1.5-flash'),

  // Optional Payment Provider (Razorpay)
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),

  // Optional Email / SMTP
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),

  // Optional Maps & Geolocation
  MAPS_API_KEY: z.string().optional().default(''),

  // Optional Cloud Storage (Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
});

/**
 * Validates process.env against schema and formats readable error output
 * @param {NodeJS.ProcessEnv} envSource
 * @returns {z.infer<typeof envSchema> & { parsedClientUrls: string[] }}
 */
export const validateEnv = (envSource = process.env) => {
  const result = envSchema.safeParse(envSource);

  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      variable: err.path.join('.'),
      message: err.message,
    }));

    const errorReport = formattedErrors
      .map((e) => `  - ${e.variable}: ${e.message}`)
      .join('\n');

    console.error(
      `\x1b[31m[FATAL] Environment validation failed:\n${errorReport}\x1b[0m`
    );
    throw new Error(`Environment validation failed:\n${errorReport}`);
  }

  const clientUrls = result.data.CLIENT_URL.split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  return {
    ...result.data,
    parsedClientUrls: clientUrls,
    isProduction: result.data.NODE_ENV === 'production',
    isDevelopment: result.data.NODE_ENV === 'development',
    isTest: result.data.NODE_ENV === 'test',
  };
};

export const env = validateEnv();
export default env;
