import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { generateAccessToken } from '../../src/common/utils/token.util.js';
import { ROLES } from '../../src/common/constants/roles.js';

describe('Role-Based Authorization Integration', () => {
  const customerToken = generateAccessToken({
    id: 'cust-1',
    email: 'cust@example.com',
    role: ROLES.CUSTOMER,
  });

  const restaurantOwnerToken = generateAccessToken({
    id: 'owner-1',
    email: 'owner@example.com',
    role: ROLES.RESTAURANT_OWNER,
  });

  const adminToken = generateAccessToken({
    id: 'admin-1',
    email: 'admin@example.com',
    role: ROLES.ADMIN,
  });

  it('forbids CUSTOMER from accessing admin routes (GET /api/v1/admin/users)', async () => {
    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('FORBIDDEN');
    expect(response.body.message).toContain('lacks permission');
  });

  it('allows ADMIN to access admin routes (GET /api/v1/admin/users)', async () => {
    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('users');
  });

  it('forbids CUSTOMER from creating restaurant items', async () => {
    const response = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Unauthorized Bistro' });

    expect(response.status).toBe(403);
  });

  it('allows RESTAURANT_OWNER to create restaurants', async () => {
    const response = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', `Bearer ${restaurantOwnerToken}`)
      .send({ name: 'Taste of Italy', cuisines: ['Italian'] });

    expect(response.status).toBe(201);
    expect(response.body.data.restaurant.name).toBe('Taste of Italy');
  });
});
