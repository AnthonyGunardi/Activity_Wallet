const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Participant, Activity, Transaction, User } = require('../../src/models');
const { ParticipantStatus, ActivityStatus, TransactionType, UserRole } = require('../../src/constants/enums');

describe('Participant Wallet API Integration', () => {
  let participant, activity;
  let staff;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    staff = await User.create({
      username: 'integ_staff_p',
      password_hash: 'staffpass',
      name: 'Staff Booth',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });

    participant = await Participant.create({
      name: 'Dewi Lestari',
      qr_code: 'SEPA-INTEG-001',
      initial_credit: 1000000,
      current_balance: 650000,
      total_spent: 350000,
      status: ParticipantStatus.ACTIVE
    });

    await Participant.create({
      name: 'Rudi Hartono',
      qr_code: 'SEPA-INTEG-BLOCKED',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.BLOCKED
    });

    activity = await Activity.create({
      name: 'Jet Ski',
      price: 350000,
      description: '15 menit bermain jet ski',
      status: ActivityStatus.ACTIVE
    });

    await Transaction.create({
      participant_id: participant.id,
      activity_id: activity.id,
      staff_id: staff.id,
      type: TransactionType.DEDUCTION,
      amount: 350000,
      balance_before: 1000000,
      balance_after: 650000,
      notes: 'Pembayaran Jet Ski'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/v1/participants/wallet/:qrCode', () => {
    test('should return 200 with participant wallet details, activities, and transaction history', async () => {
      const res = await request(app).get('/api/v1/participants/wallet/SEPA-INTEG-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('participant');
      expect(res.body.data.participant.name).toBe('Dewi Lestari');
      expect(res.body.data.participant.current_balance).toBe(650000);
      expect(res.body.data.participant.total_spent).toBe(350000);

      expect(res.body.data).toHaveProperty('activities');
      expect(Array.isArray(res.body.data.activities)).toBe(true);
      expect(res.body.data.activities[0].name).toBe('Jet Ski');
      expect(res.body.data.activities[0].is_affordable).toBe(true);

      expect(res.body.data).toHaveProperty('recent_transactions');
      expect(res.body.data.recent_transactions.length).toBe(1);
      expect(res.body.data.recent_transactions[0].activity_name).toBe('Jet Ski');
    });

    test('should return 400 when qrCode parameter fails validation (e.g., too short)', async () => {
      const res = await request(app).get('/api/v1/participants/wallet/ab');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should return 404 with PARTICIPANT_NOT_FOUND for non-existent QR token', async () => {
      const res = await request(app).get('/api/v1/participants/wallet/SEPA-UNKNOWN-999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PARTICIPANT_NOT_FOUND');
    });

    test('should return 403 with PARTICIPANT_BLOCKED for blocked participant QR token', async () => {
      const res = await request(app).get('/api/v1/participants/wallet/SEPA-INTEG-BLOCKED');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PARTICIPANT_BLOCKED');
    });
  });
});
