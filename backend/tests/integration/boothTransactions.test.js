const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Participant, Activity, User } = require('../../src/models');
const { ParticipantStatus, ActivityStatus, UserRole } = require('../../src/constants/enums');
const { generateToken } = require('../../src/services/authService');

describe('Booth API Integration Tests', () => {
  let staffUser, adminUser, staffToken, adminToken;
  let jetSkiActivity;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    staffUser = await User.create({
      username: 'integ_booth_staff',
      password_hash: 'staffpass',
      name: 'Booth Staff',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });
    staffToken = generateToken(staffUser);

    adminUser = await User.create({
      username: 'integ_booth_admin',
      password_hash: 'adminpass',
      name: 'Admin Supervisor',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });
    adminToken = generateToken(adminUser);

    await Participant.create({
      name: 'Citra Kirana',
      qr_code: 'SEPA-BOOTH-INTEG-001',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.ACTIVE
    });

    await Participant.create({
      name: 'Farhan Halim',
      qr_code: 'SEPA-BOOTH-INTEG-BLOCKED',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.BLOCKED
    });

    await Participant.create({
      name: 'Bambang Pamungkas',
      qr_code: 'SEPA-BOOTH-INTEG-LOW',
      initial_credit: 1000000,
      current_balance: 100000,
      total_spent: 900000,
      status: ParticipantStatus.ACTIVE
    });

    jetSkiActivity = await Activity.create({
      name: 'Jet Ski Integ',
      price: 350000,
      description: '15 menit bermain jet ski',
      status: ActivityStatus.ACTIVE
    });

    await Activity.create({
      name: 'Banana Boat Integ',
      price: 150000,
      description: '15 menit banana boat',
      status: ActivityStatus.ACTIVE
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/booth/scan', () => {
    test('should reject request without authentication token (401)', async () => {
      const res = await request(app)
        .post('/api/v1/booth/scan')
        .send({ qr_code: 'SEPA-BOOTH-INTEG-001' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('should return 200 with participant details and eligible activities when scanned by staff', async () => {
      const res = await request(app)
        .post('/api/v1/booth/scan')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ qr_code: 'SEPA-BOOTH-INTEG-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.participant.name).toBe('Citra Kirana');
      expect(res.body.data.participant.current_balance).toBe(1000000);
      expect(Array.isArray(res.body.data.eligible_activities)).toBe(true);
    });

    test('should return 400 for invalid request body', async () => {
      const res = await request(app)
        .post('/api/v1/booth/scan')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ qr_code: 'a' }); // < 3 chars

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should return 403 when participant is BLOCKED', async () => {
      const res = await request(app)
        .post('/api/v1/booth/scan')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ qr_code: 'SEPA-BOOTH-INTEG-BLOCKED' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PARTICIPANT_BLOCKED');
    });
  });

  describe('POST /api/v1/booth/transactions', () => {
    test('should reject deduction without authentication token (401)', async () => {
      const res = await request(app)
        .post('/api/v1/booth/transactions')
        .send({
          qr_code: 'SEPA-BOOTH-INTEG-001',
          activity_id: jetSkiActivity.id
        });

      expect(res.status).toBe(401);
    });

    test('should successfully execute deduction and return receipt (200)', async () => {
      const res = await request(app)
        .post('/api/v1/booth/transactions')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          qr_code: 'SEPA-BOOTH-INTEG-001',
          activity_id: jetSkiActivity.id,
          notes: 'Transaksi Booth Jet Ski'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction.amount).toBe(350000);
      expect(res.body.data.updated_balance).toBe(650000);
    });

    test('should reject deduction with 422 INSUFFICIENT_BALANCE if balance is too low', async () => {
      const res = await request(app)
        .post('/api/v1/booth/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          qr_code: 'SEPA-BOOTH-INTEG-LOW',
          activity_id: jetSkiActivity.id
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('INSUFFICIENT_BALANCE');
    });
  });

  describe('GET /api/v1/booth/transactions/recent', () => {
    test('should return recent transactions processed by authenticated staff (200)', async () => {
      const res = await request(app)
        .get('/api/v1/booth/transactions/recent')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
      expect(res.body.data.transactions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
