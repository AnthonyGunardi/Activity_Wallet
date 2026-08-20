const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Activity, User } = require('../../src/models');
const { ActivityStatus, UserRole } = require('../../src/constants/enums');
const { generateToken } = require('../../src/services/authService');

describe('Admin Activities API Integration Tests', () => {
  let adminUser, staffUser, adminToken, staffToken;
  let sampleActivity;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    adminUser = await User.create({
      username: 'integ_admin_act',
      password_hash: 'adminpass',
      name: 'Admin Supervisor',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });
    adminToken = generateToken(adminUser);

    staffUser = await User.create({
      username: 'integ_staff_act',
      password_hash: 'staffpass',
      name: 'Staff Member',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });
    staffToken = generateToken(staffUser);

    sampleActivity = await Activity.create({
      name: 'Jet Ski',
      price: 350000,
      description: 'Water jet ski ride',
      status: ActivityStatus.ACTIVE
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/v1/admin/activities', () => {
    test('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/admin/activities');
      expect(res.status).toBe(401);
    });

    test('should reject non-admin request with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/admin/activities')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    test('should return 200 with activity list when called by admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('activities');
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(res.body.data.activities.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/admin/activities/:id', () => {
    test('should return 200 with single activity details', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/activities/${sampleActivity.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(sampleActivity.id);
      expect(res.body.data.name).toBe('Jet Ski');
    });

    test('should return 404 for non-existent activity ID', async () => {
      const res = await request(app)
        .get('/api/v1/admin/activities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ACTIVITY_NOT_FOUND');
    });
  });

  describe('POST /api/v1/admin/activities', () => {
    test('should create a new activity with valid payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Donut Boat',
          price: 175000,
          description: 'Fun donut ride'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Donut Boat');
      expect(res.body.data.price).toBe(175000);
      expect(res.body.data.status).toBe(ActivityStatus.ACTIVE);
    });

    test('should reject invalid payload (e.g. negative price) with 400', async () => {
      const res = await request(app)
        .post('/api/v1/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Boat',
          price: -5000
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject duplicate activity name with 409', async () => {
      const res = await request(app)
        .post('/api/v1/admin/activities')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jet Ski',
          price: 400000
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ACTIVITY_ALREADY_EXISTS');
    });
  });

  describe('PUT /api/v1/admin/activities/:id', () => {
    test('should update existing activity price and status', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/activities/${sampleActivity.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 375000,
          status: ActivityStatus.INACTIVE
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(375000);
      expect(res.body.data.status).toBe(ActivityStatus.INACTIVE);
    });

    test('should return 404 when updating non-existent activity', async () => {
      const res = await request(app)
        .put('/api/v1/admin/activities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 200000
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ACTIVITY_NOT_FOUND');
    });
  });
});
