import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Not Found 404 Handler Integration', () => {
  it('returns standard 404 error envelope for nonexistent route', async () => {
    const response = await request(app).get('/api/v1/nonexistent-endpoint-test');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: expect.stringContaining('Cannot GET /api/v1/nonexistent-endpoint-test'),
      code: 'NOT_FOUND',
      details: [],
    });
  });

  it('returns standard 404 error envelope for invalid HTTP methods', async () => {
    const response = await request(app).delete('/health');

    expect(response.status).toBe(404);
    expect(response.body.code).toBe('NOT_FOUND');
    expect(response.body.success).toBe(false);
  });
});
