const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Participant, Activity, Transaction } = require('../../src/models');
const { generateToken } = require('../../src/services/authService');
const { UserRole, ParticipantStatus, ActivityStatus, TransactionType } = require('../../src/constants/enums');
const adminReportService = require('../../src/services/adminReportService');
const exportService = require('../../src/services/exportService');

describe('Admin Activity Summary & Export Integration Tests', () => {
  let adminToken;
  let staffToken;
  let adminUser;
  let staffUser;
  let sampleParticipant;
  let sampleActivity;

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
      name: 'Booth Staff',
      username: 'staff',
      password_hash: 'hashedpassword',
      role: UserRole.STAFF
    });

    adminToken = generateToken(adminUser);
    staffToken = generateToken(staffUser);

    sampleParticipant = await Participant.create({
      name: 'Andi Pratama',
      qr_code: 'SEPA-ANDI01',
      initial_credit: 1000000,
      current_balance: 350000,
      total_spent: 650000,
      status: ParticipantStatus.ACTIVE
    });

    sampleActivity = await Activity.create({
      name: 'Jetski Sea',
      price: 650000,
      status: ActivityStatus.ACTIVE
    });

    await Transaction.create({
      participant_id: sampleParticipant.id,
      activity_id: sampleActivity.id,
      staff_id: staffUser.id,
      type: TransactionType.DEDUCTION,
      amount: 650000,
      balance_before: 1000000,
      balance_after: 350000,
      notes: 'Jetski 15 min'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/v1/admin/reports/activities/summary', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/admin/reports/activities/summary');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects staff user requests with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/summary')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('returns activity summary with accurate aggregates for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.total_activities).toBe(1);
      expect(res.body.data.summary.total_deductions).toBe(1);
      expect(res.body.data.summary.total_gross_amount).toBe(650000);
      expect(res.body.data.summary.total_net_amount).toBe(650000);
      expect(res.body.data.activities).toHaveLength(1);
      expect(res.body.data.activities[0].name).toBe('Jetski Sea');
      expect(res.body.data.activities[0].share_percentage).toBe(100);
      expect(res.body.meta.generated_at).toBeDefined();
    });

    it('filters summary by status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/summary?status=INACTIVE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.total_activities).toBe(0);
      expect(res.body.data.activities).toEqual([]);
    });

    it('returns 400 if query parameters are invalid', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/summary?status=INVALID_STATUS')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('handles unexpected errors gracefully with 500', async () => {
      jest.spyOn(adminReportService, 'getActivityTransactionsSummary').mockRejectedValueOnce(new Error('DB failure'));

      const res = await request(app)
        .get('/api/v1/admin/reports/activities/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      adminReportService.getActivityTransactionsSummary.mockRestore();
    });
  });

  describe('GET /api/v1/admin/reports/activities/export', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/admin/reports/activities/export');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects staff user requests with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/export')
        .set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('exports activities recap report as CSV', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/export?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename=');
      expect(res.text).toContain('Jetski Sea');
      expect(res.text).toContain('650000');
      expect(res.text).toContain('100%');
    });

    it('exports activities recap report as Excel', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/export?format=excel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/vnd.ms-excel');
      expect(res.headers['content-disposition']).toContain('.xls');
      expect(res.text).toContain('<Worksheet ss:Name="Rekap Wahana">');
      expect(res.text).toContain('Jetski Sea');
    });

    it('returns 400 when format is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/admin/reports/activities/export?format=pdf')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('handles unexpected errors gracefully with 500', async () => {
      jest.spyOn(exportService, 'generateActivitiesRecapExport').mockRejectedValueOnce(new Error('Export error'));

      const res = await request(app)
        .get('/api/v1/admin/reports/activities/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      exportService.generateActivitiesRecapExport.mockRestore();
    });
  });
});
