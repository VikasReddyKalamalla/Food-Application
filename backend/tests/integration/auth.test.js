import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';

describe('Authentication & Session Integration (/api/v1/auth)', () => {
  const validUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'SecurePassword123!',
    phone: '+1234567890',
  };

  it('registers a new customer successfully and returns access token and HttpOnly cookie', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.email).toBe(validUser.email);
    expect(response.body.data.user.role).toBe('CUSTOMER');
    expect(response.body.data.user).not.toHaveProperty('passwordHash');
    expect(response.body.data).toHaveProperty('accessToken');

    // Verify Set-Cookie header contains HttpOnly refreshToken
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken=') && c.includes('HttpOnly'))).toBe(true);
  });

  it('rejects registration with duplicate email address with 409 Conflict', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const duplicateResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.code).toBe('CONFLICT');
    expect(duplicateResponse.body.message).toContain('already exists');
  });

  it('rejects registration when password lacks uppercase or number with 422 Unprocessable Entity', async () => {
    const invalidUser = {
      ...validUser,
      email: 'weakpass@example.com',
      password: 'weakpassword',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(invalidUser);

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(response.body.details.some((d) => d.field.includes('password'))).toBe(true);
  });

  it('rejects client attempt to self-register with ADMIN role', async () => {
    const adminAttempt = {
      ...validUser,
      email: 'hacker@example.com',
      role: 'ADMIN',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(adminAttempt);

    expect(response.status).toBe(422);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });

  it('authenticates user on login with valid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data).toHaveProperty('accessToken');
    expect(loginResponse.body.data.user.email).toBe(validUser.email);
  });

  it('rejects login with incorrect password with 401 Unauthorized', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword123!' });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.code).toBe('UNAUTHORIZED');
  });

  it('fetches authenticated user profile at /me with Bearer token', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const accessToken = regRes.body.data.accessToken;

    const meResponse = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user.email).toBe(validUser.email);
  });

  it('rejects /me without Bearer token with 401 Unauthorized', async () => {
    const meResponse = await request(app).get('/api/v1/auth/me');
    expect(meResponse.status).toBe(401);
  });

  it('rotates refresh token and invalidates old token session on refresh', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const originalRefreshToken = regRes.body.data.refreshToken;

    // First refresh: should succeed
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: originalRefreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data).toHaveProperty('accessToken');
    expect(refreshRes.body.data).toHaveProperty('refreshToken');

    const newRefreshToken = refreshRes.body.data.refreshToken;
    expect(newRefreshToken).not.toBe(originalRefreshToken);

    // Replay attack test: reusing old refresh token must be rejected!
    const replayRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: originalRefreshToken });

    expect(replayRes.status).toBe(401);
    expect(replayRes.body.message).toContain('revoked');
  });

  it('logs out and revokes refresh token session', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const refreshToken = regRes.body.data.refreshToken;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    expect(logoutRes.status).toBe(200);

    // Attempting to refresh with logged-out token must fail
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(401);
  });

  it('executes full password reset lifecycle safely', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    // Request reset
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: validUser.email });

    expect(forgotRes.status).toBe(200);
    const resetToken = forgotRes.body.data.resetToken;
    expect(resetToken).toBeDefined();

    // Reset password with token
    const newPassword = 'NewlyUpdatedPassword123!';
    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: resetToken, newPassword });

    expect(resetRes.status).toBe(200);

    // Log in with new password
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: newPassword });

    expect(loginRes.status).toBe(200);
  });
});
