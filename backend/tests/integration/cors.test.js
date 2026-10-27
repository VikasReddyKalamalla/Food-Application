import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('CORS Integration & Allowlist Boundary', () => {
  it('allows access and sets CORS headers for authorized origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3000');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('rejects preflight requests from unauthorized origins with 403 or CORS error', async () => {
    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'https://unauthorized-evil-site.com')
      .set('Access-Control-Request-Method', 'POST');

    // Either 403 or no Access-Control-Allow-Origin header is set
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
