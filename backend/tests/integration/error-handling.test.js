import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Centralized Error Handling Integration', () => {
  it('catches malformed JSON syntax in request body and returns 400 Bad Request', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"bad_json": ');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Malformed JSON syntax in request body',
      code: 'BAD_REQUEST',
      details: expect.any(Array),
    });
  });

  it('formats Zod validation errors with field-level details and 422 status', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email' }); // Missing required name and password

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details.length).toBeGreaterThan(0);
  });
});
