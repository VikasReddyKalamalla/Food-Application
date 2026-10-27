import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createRateLimiter } from '../../src/common/middleware/rate-limiter.middleware.js';

describe('Rate Limiter Integration', () => {
  it('triggers 429 Too Many Requests and returns standard error envelope when max limit is exceeded', async () => {
    const testApp = express();
    const testLimiter = createRateLimiter({
      max: 3,
      windowMs: 60 * 1000,
      skip: () => false, // explicitly enforce
    });

    testApp.use(testLimiter);
    testApp.get('/test-limit', (req, res) => res.json({ success: true }));

    // Send 3 allowed requests
    for (let i = 0; i < 3; i++) {
      const res = await request(testApp).get('/test-limit');
      expect(res.status).toBe(200);
    }

    // 4th request must be blocked
    const blockedRes = await request(testApp).get('/test-limit');
    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body).toEqual({
      success: false,
      message: expect.stringContaining('Too many requests'),
      code: 'RATE_LIMIT_EXCEEDED',
      details: expect.any(Array),
    });
    expect(blockedRes.body.details[0]).toHaveProperty('retryAfterSeconds');
  });
});
