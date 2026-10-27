import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import * as databaseModule from '../../src/config/database.js';

describe('Readiness Probe Integration (GET /ready)', () => {
  it('returns 503 Service Unavailable when database is not connected', async () => {
    vi.spyOn(databaseModule, 'getDatabaseHealth').mockReturnValue({
      status: 'disconnected',
      isHealthy: false,
      host: null,
      name: null,
    });

    const response = await request(app).get('/ready');

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('ready', false);
    expect(response.body.message).toContain('Database is not connected');
  });

  it('returns 200 OK when database connection is healthy', async () => {
    vi.spyOn(databaseModule, 'getDatabaseHealth').mockReturnValue({
      status: 'connected',
      isHealthy: true,
      host: 'localhost',
      name: 'food_delivery_test_db',
    });

    const response = await request(app).get('/ready');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ready', true);
    expect(response.body.database).toHaveProperty('isHealthy', true);
  });
});
