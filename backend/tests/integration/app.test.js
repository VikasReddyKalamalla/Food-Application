import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app, { createApp } from '../../src/app.js';

describe('Application Factory Integration', () => {
  it('creates an Express application instance', () => {
    const customApp = createApp();
    expect(customApp).toBeDefined();
    expect(typeof customApp.use).toBe('function');
  });

  it('serves Swagger documentation at /api-docs', async () => {
    const response = await request(app).get('/api-docs/');
    // Swagger UI returns 200 or 301 redirect to /api-docs/
    expect([200, 301]).toContain(response.status);
  });
});
