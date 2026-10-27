import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Health Probe Integration (GET /health)', () => {
  it('returns 200 OK with healthy status, uptime, and environment', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment', 'test');
  });

  it('propagates or attaches X-Request-ID header to responses', async () => {
    const response = await request(app).get('/health');

    expect(response.headers).toHaveProperty('x-request-id');
    expect(response.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('preserves existing X-Request-ID when provided by client', async () => {
    const customRequestId = 'custom-trace-uuid-123456';
    const response = await request(app)
      .get('/health')
      .set('X-Request-ID', customRequestId);

    expect(response.headers['x-request-id']).toBe(customRequestId);
  });
});
