const request = require('supertest');
const express = require('express');
const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');
const { UserRole } = require('../../src/constants/enums');
const { requireAuth, requireRole } = require('../../src/middleware/authMiddleware');
const errorHandler = require('../../src/middleware/errorHandler');
const { formatSuccess } = require('../../src/utils/responseEnvelope');

describe('Authentication API & Role Middleware Integration', () => {
  let adminToken, staffToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await User.create({
      username: 'integ_admin',
      password_hash: 'adminpassword',
      name: 'Integration Admin',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });

    await User.create({
      username: 'integ_staff',
      password_hash: 'staffpassword',
      name: 'Integration Staff',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/auth/login', () => {
    test('should return 200 with JWT token and user info on valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'integ_admin', password: 'adminpassword' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.username).toBe('integ_admin');
      expect(res.body.data.user.role).toBe(UserRole.ADMIN);

      adminToken = res.body.data.token;
    });

    test('should obtain staff token successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'integ_staff', password: 'staffpassword' });

      expect(res.status).toBe(200);
      staffToken = res.body.data.token;
    });

    test('should return 401 with error envelope on wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'integ_admin', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    test('should return 400 when username or password is missing (Schema Validation)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'in' }); // < 3 chars, missing password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error).toHaveProperty('details');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('should return 200 with user profile when Bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('integ_admin');
      expect(res.body.data.user.name).toBe('Integration Admin');
    });

    test('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('should return 401 when Bearer token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Role-Based Access Control Middleware (requireRole)', () => {
    let testApp;

    beforeAll(() => {
      testApp = express();
      testApp.use(express.json());

      testApp.get('/admin-only', requireAuth, requireRole(UserRole.ADMIN), (req, res) => {
        res.json(formatSuccess({ access: 'granted', role: 'ADMIN' }));
      });

      testApp.get('/staff-or-admin', requireAuth, requireRole(UserRole.STAFF, UserRole.ADMIN), (req, res) => {
        res.json(formatSuccess({ access: 'granted', role: req.user.role }));
      });

      testApp.get('/no-auth-role', requireRole(UserRole.ADMIN), (req, res) => {
        res.json(formatSuccess({ access: 'granted' }));
      });

      testApp.use(errorHandler);
    });

    test('Admin should access admin-only route (200)', async () => {
      const res = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('ADMIN');
    });

    test('Staff should be forbidden from admin-only route (403)', async () => {
      const res = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    test('Both Staff and Admin should access shared route (200)', async () => {
      const staffRes = await request(testApp)
        .get('/staff-or-admin')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(staffRes.status).toBe(200);

      const adminRes = await request(testApp)
        .get('/staff-or-admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(adminRes.status).toBe(200);
    });

    test('requireRole without requireAuth should return 401 UNAUTHORIZED', async () => {
      const res = await request(testApp).get('/no-auth-role');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
