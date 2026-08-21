const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Participant, User } = require('../../src/models');
const { ParticipantStatus, UserRole } = require('../../src/constants/enums');
const { generateToken } = require('../../src/services/authService');

describe('Admin Participants API Integration Tests', () => {
  let adminUser, staffUser, adminToken, staffToken;
  let testParticipant;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    adminUser = await User.create({
      username: 'integ_admin_part',
      password_hash: 'adminpass',
      name: 'Admin Supervisor',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });
    adminToken = generateToken(adminUser);

    staffUser = await User.create({
      username: 'integ_staff_part',
      password_hash: 'staffpass',
      name: 'Staff Member',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });
    staffToken = generateToken(staffUser);

    testParticipant = await Participant.create({
      name: 'Indra Bekti',
      qr_code: 'SEPA-INTEG-P1',
      initial_credit: 1000000,
      current_balance: 850000,
      total_spent: 150000,
      status: ParticipantStatus.ACTIVE
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/v1/admin/participants', () => {
    test('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/admin/participants');
      expect(res.status).toBe(401);
    });

    test('should reject non-admin request with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/v1/admin/participants')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    test('should return 200 with participant list and pagination when called by admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/participants')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('participants');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /api/v1/admin/participants', () => {
    test('should create a single new participant with standard default credit', async () => {
      const res = await request(app)
        .post('/api/v1/admin/participants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Raffi Ahmad'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Raffi Ahmad');
      expect(res.body.data.current_balance).toBe(1000000);
    });

    test('should reject invalid payload (e.g., missing name) with 400', async () => {
      const res = await request(app)
        .post('/api/v1/admin/participants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/admin/participants/bulk', () => {
    test('should import batch array of participants', async () => {
      const res = await request(app)
        .post('/api/v1/admin/participants/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          participants: [
            { name: 'Batch Participant 1' },
            { name: 'Batch Participant 2' }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.created_count).toBe(2);
    });
  });

  describe('GET /api/v1/admin/participants/:id', () => {
    test('should retrieve single participant with details', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/participants/${testParticipant.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testParticipant.id);
      expect(res.body.data.name).toBe('Indra Bekti');
    });

    test('should return 404 for non-existent participant ID', async () => {
      const res = await request(app)
        .get('/api/v1/admin/participants/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('PARTICIPANT_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/admin/participants/:id', () => {
    test('should update participant name', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/participants/${testParticipant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Indra Bekti Bekti' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Indra Bekti Bekti');
    });

    test('should reject invalid update payload with 400', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/participants/${testParticipant.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/admin/participants/:id', () => {
    test('should allow deleting participant with no transaction records', async () => {
      const unused = await Participant.create({
        name: 'Unused Test Participant',
        qr_code: 'SEPA-UNUSED-DEL',
        initial_credit: 1000000,
        current_balance: 1000000,
        total_spent: 0,
        status: ParticipantStatus.ACTIVE
      });

      const res = await request(app)
        .delete(`/api/v1/admin/participants/${unused.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    test('should return 404 when deleting non-existent participant', async () => {
      const res = await request(app)
        .delete('/api/v1/admin/participants/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('PARTICIPANT_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/admin/participants/:id/reissue-qr', () => {
    test('should reissue a new QR code token preserving wallet balance', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/participants/${testParticipant.id}/reissue-qr`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.previous_qr_code).toBe('SEPA-INTEG-P1');
      expect(res.body.data.new_qr_code).toMatch(/^SEPA-/);
      expect(res.body.data.participant.current_balance).toBe(850000);
    });
  });

  describe('PUT /api/v1/admin/participants/:id/status', () => {
    test('should update participant status to BLOCKED', async () => {
      const res = await request(app)
        .put(`/api/v1/admin/participants/${testParticipant.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ParticipantStatus.BLOCKED });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(ParticipantStatus.BLOCKED);
    });
  });
});
