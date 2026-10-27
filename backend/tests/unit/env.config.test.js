import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/config/env.js';

describe('Environment Configuration Validation', () => {
  const validBaseEnv = {
    NODE_ENV: 'test',
    PORT: '5000',
    MONGODB_URI: 'mongodb://localhost:27017/food_delivery_test',
    CLIENT_URL: 'http://localhost:3000,http://localhost:5173',
    JWT_ACCESS_SECRET: 'min_32_characters_secret_key_for_access_token_testing',
    JWT_REFRESH_SECRET: 'min_32_characters_secret_key_for_refresh_token_testing',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    COOKIE_SECURE: 'false',
    COOKIE_SAME_SITE: 'lax',
    LOG_LEVEL: 'silent',
  };

  it('successfully validates a complete and compliant environment config', () => {
    const config = validateEnv(validBaseEnv);
    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(5000);
    expect(config.parsedClientUrls).toEqual([
      'http://localhost:3000',
      'http://localhost:5173',
    ]);
    expect(config.isTest).toBe(true);
    expect(config.isProduction).toBe(false);
  });

  it('fails fast when JWT_ACCESS_SECRET is under 32 characters', () => {
    const invalidEnv = { ...validBaseEnv, JWT_ACCESS_SECRET: 'too_short' };
    expect(() => validateEnv(invalidEnv)).toThrow(/Environment validation failed/);
  });

  it('fails fast when MONGODB_URI does not start with mongodb protocol', () => {
    const invalidEnv = { ...validBaseEnv, MONGODB_URI: 'http://localhost:27017' };
    expect(() => validateEnv(invalidEnv)).toThrow(/MONGODB_URI must start with mongodb/);
  });

  it('uses default values for optional variables without throwing', () => {
    const minimalEnv = {
      MONGODB_URI: 'mongodb://localhost:27017/food_test',
      JWT_ACCESS_SECRET: 'a_very_secure_and_long_jwt_access_secret_sample',
      JWT_REFRESH_SECRET: 'a_very_secure_and_long_jwt_refresh_secret_sample',
    };
    const config = validateEnv(minimalEnv);
    expect(config.PORT).toBe(5000);
    expect(config.NODE_ENV).toBe('development');
    expect(config.COOKIE_SAME_SITE).toBe('lax');
    expect(config.AI_PROVIDER).toBe('mock');
  });
});
