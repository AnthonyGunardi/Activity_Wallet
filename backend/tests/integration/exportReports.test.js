const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Participant, Activity, Transaction } = require('../../src/models');
const { generateToken } = require('../../src/services/authService');
const { UserRole, ParticipantStatus, TransactionType } = require('../../src/constants/enums');

describe('Admin Export Reports Integration Tests', () => {
  let adminToken;
  let staffToken;
  let sampleParticipant;
  let sampleActivity;
  let adminUser;
  let staffUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Transaction.destroy({ where: {}, truncate: true, cascade: true, force: true });
    await Activity.destroy({ where: {}, truncate: true, cascade: true, force: true });
    await Participant.destroy({ where: {}, truncate: true, cascade: true, force: true });
    await User.destroy({ where: {}, truncate: true, cascade: true, force: true });

    adminUser = await User.create({
      name: 'Super Admin',
      username: 'admin',
      password_hash: 'hashedpassword',
      role: UserRole.ADMIN
    });

    staffUser = await User.create({
      name: 'Booth Staff 1',
      username: 'staff1',
      password_hash: 'hashedpassword',
      role: UserRole.STAFF
    });

    adminToken = generateToken(adminUser);
    staffToken = generateToken(staffUser);

    sampleParticipant = await Participant.create({
      name: 'Rudi Hartono',
      qr_code: 'SEPA-RUDI01',
      initial_credit: 1000000,
      current_balance: 700000,
      total_spent: 300000,
      status: ParticipantStatus.ACTIVE
    });

    sampleActivity = await Activity.create({
      name: 'Snorkeling Trip',
      price: 300000,
      status: 'ACTIVE'
    });

    await Transaction.create({
      participant_id: sampleParticipant.id,
      activity_id: sampleActivity.id,
      staff_id: staffUser.id,
      type: TransactionType.DEDUCTION,
      amount: 300000,
      balance_before: 1000000,
      balance_after: 700000,
      notes: 'Snorkeling Sepa Island'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/v1/admin/reports/participants/export', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/admin/reports/participants/export');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects staff requests with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/participants/export')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('downloads CSV report for participants with 200 and attachment header', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/participants/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename=');
      expect(res.text).toContain('Rudi Hartono');
      expect(res.text).toContain('SEPA-RUDI01');
      expect(res.text).toContain('700000');
    });

    it('downloads Excel format report when requested', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/participants/export?format=excel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.ms-excel');
      expect(res.headers['content-disposition']).toContain('.xls');
      expect(res.text).toContain('<Worksheet ss:Name="Participants">');
      expect(res.text).toContain('Rudi Hartono');
    });
  });

  describe('GET /api/v1/admin/reports/transactions/export', () => {
    it('rejects unauthorized requests with 401/403', async () => {
      const res401 = await request(app).get('/api/v1/admin/reports/transactions/export');
      expect(res401.status).toBe(401);

      const res403 = await request(app)
        .get('/api/v1/admin/reports/transactions/export')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res403.status).toBe(403);
    });

    it('downloads CSV audit ledger report with all transaction metadata', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/transactions/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename=');
      expect(res.text).toContain('Rudi Hartono');
      expect(res.text).toContain('Snorkeling Trip');
      expect(res.text).toContain('300000');
      expect(res.text).toContain('DEDUCTION');
      expect(res.text).toContain('Booth Staff 1');
    });

    it('downloads Excel audit ledger report with filter', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/transactions/export?format=excel&type=DEDUCTION')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.ms-excel');
      expect(res.text).toContain('<Worksheet ss:Name="Transactions">');
      expect(res.text).toContain('Snorkeling Trip');
    });

    it('downloads CSV report including peer-to-peer transfer transactions with null activity and staff', async () => {
      await Transaction.create({
        participant_id: sampleParticipant.id,
        activity_id: null,
        staff_id: null,
        type: TransactionType.TRANSFER_OUT,
        amount: 150000,
        balance_before: 700000,
        balance_after: 550000,
        notes: 'Transfer ke Budi (SEPA-002) - Patungan Jet Ski'
      });

      const res = await request(app)
        .get('/api/v1/admin/reports/transactions/export?format=csv&type=TRANSFER_OUT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.text).toContain('TRANSFER_OUT');
      expect(res.text).toContain('150000');
      expect(res.text).toContain('Transfer ke Budi (SEPA-002) - Patungan Jet Ski');
      expect(res.text).toContain('"N/A"');
    });

    it('handles unexpected service error in exportParticipants gracefully', async () => {
      const exportService = require('../../src/services/exportService');
      jest.spyOn(exportService, 'generateParticipantsExport').mockRejectedValueOnce(new Error('Export crash'));

      const res = await request(app)
        .get('/api/v1/admin/reports/participants/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      exportService.generateParticipantsExport.mockRestore();
    });

    it('handles unexpected service error in exportTransactions gracefully', async () => {
      const exportService = require('../../src/services/exportService');
      jest.spyOn(exportService, 'generateTransactionsExport').mockRejectedValueOnce(new Error('Tx export crash'));

      const res = await request(app)
        .get('/api/v1/admin/reports/transactions/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      exportService.generateTransactionsExport.mockRestore();
    });
  });
});
