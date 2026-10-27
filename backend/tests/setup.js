import { beforeEach, afterEach, vi } from 'vitest';
import userStore from '../src/modules/auth/user-store.js';
import tokenStore from '../src/modules/auth/token-store.js';

// Enforce test environment
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_must_be_at_least_32_characters_long_for_security';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_must_be_at_least_32_characters_long_for_security';
process.env.MONGODB_URI = 'mongodb://localhost:27017/food_delivery_test_db';
process.env.CLIENT_URL = 'http://localhost:3000,http://localhost:5173,https://test.client.com';
process.env.AI_PROVIDER = 'mock';
process.env.SKIP_RATE_LIMIT = 'true';

beforeEach(() => {
  // Clear in-memory stores before each test to maintain strict test isolation
  userStore.clear();
  tokenStore.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
