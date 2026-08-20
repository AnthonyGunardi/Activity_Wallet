const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Participant, Activity, Transaction } = require('../../src/models');
const { UserRole, ParticipantStatus, ActivityStatus, TransactionType } = require('../../src/constants/enums');
const { generateToken } = require('../../src/services/authService');

describe('Admin Ledger & Refund API Integration Tests', () => {
  let adminUser, staffUser, adminToken, staffToken;
  let testParticipant, testActivity, testDeduction;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    adminUser = await User.create({
      username: 'integ_admin_ledger',
      password_hash: 'adminpass',
      name: 'Admin Supervisor',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });
    adminToken = generateToken(adminUser);

    staffUser = await User.create({
      username: 'integ_staff_ledger',
      password_hash: 'staffpass',
      name: 'Staff Member',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });
    staffToken = generateToken(staffUser);

    testActivity = await Activity.create({
      name: 'Donut Boat Adventure',
      price: 175000,
      status: ActivityStatus.ACTIVE
    });

    testParticipant = await Participant.create({
      name: 'Jessica Iskandar',
      qr_code: 'SEPA-LEDGER-01',
      initial_credit: 1000000,
      current_balance: 825000,
      total_spent: 175000,
      status: ParticipantStatus.ACTIVE
    });

    testDeduction = await Transaction.create({
      participant_id: testParticipant.id,
      activity_id: testActivity.id,
      staff_id: staffUser.id,
      type: TransactionType.DEDUCTION,
      amount: 175000,
      balance_before: 1000000,
      balance_after: 825000,
      notes: 'Test deduction for donut boat'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/v1/admin/dashboard/summary', () => {
    test('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard/summary');
      expect(res.status).toBe(401);
    });

    test('should reject non-admin request with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/summary')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
    });

    test('should return 200 with aggregated dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_participants');
      expect(res.body.data).toHaveProperty('total_allocated_credit');
      expect(res.body.data).toHaveProperty('total_spent_credit');
      expect(res.body.data).toHaveProperty('remaining_balance');
      expect(res.body.data).toHaveProperty('total_transactions');
    });
  });

  describe('GET /api/v1/admin/transactions', () => {
    test('should return 200 with paginated transaction audit ledger', async () => {
      const res = await request(app)
        .get('/api/v1/admin/transactions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transactions');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.data.transactions.length).toBeGreaterThanOrEqual(1);
    });

    test('should filter ledger by transaction type', async () => {
      const res = await request(app)
        .get('/api/v1/admin/transactions?type=DEDUCTION')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.transactions.every((tx) => tx.type === 'DEDUCTION')).toBe(true);
    });
  });

  describe('POST /api/v1/admin/transactions/:id/refund', () => {
    test('should reject refund request from non-admin with 403', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/transactions/${testDeduction.id}/refund`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ notes: 'Unauthorized refund' });

      expect(res.status).toBe(403);
    });

    test('should process refund, update participant balance, and create refund record', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/transactions/${testDeduction.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Supervisor approved refund' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.refund_transaction.type).toBe('REFUND');
      expect(res.body.data.refund_transaction.amount).toBe(175000);
      expect(res.body.data.restored_balance).toBe(1000000);
    });

    test('should reject refund if transaction is already refunded with 422', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/transactions/${testDeduction.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Second refund attempt' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('ALREADY_REFUNDED');
    });
  });
});
