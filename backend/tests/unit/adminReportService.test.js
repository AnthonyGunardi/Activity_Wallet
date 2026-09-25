const { sequelize, User, Participant, Activity, Transaction } = require('../../src/models');
const { UserRole, ParticipantStatus, ActivityStatus, TransactionType } = require('../../src/constants/enums');
const adminReportService = require('../../src/services/adminReportService');

describe('AdminReportService Unit Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Transaction.destroy({ where: {}, truncate: true });
    await Participant.destroy({ where: {}, truncate: true });
    await Activity.destroy({ where: {}, truncate: true });
    await User.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('getDashboardSummary', () => {
    test('should calculate accurate metrics when database has data', async () => {
      const admin = await User.create({
        username: 'rep_admin',
        password_hash: 'pass',
        name: 'Supervisor',
        role: UserRole.ADMIN
      });

      const act1 = await Activity.create({
        name: 'Jet Ski',
        price: 350000,
        status: ActivityStatus.ACTIVE
      });
      await Activity.create({
        name: 'Banana Boat',
        price: 150000,
        status: ActivityStatus.INACTIVE
      });

      const p1 = await Participant.create({
        name: 'Participant A',
        qr_code: 'SEPA-A',
        initial_credit: 1000000,
        current_balance: 650000,
        total_spent: 350000,
        status: ParticipantStatus.ACTIVE
      });
      await Participant.create({
        name: 'Participant B',
        qr_code: 'SEPA-B',
        initial_credit: 1000000,
        current_balance: 1000000,
        total_spent: 0,
        status: ParticipantStatus.BLOCKED
      });

      await Transaction.create({
        participant_id: p1.id,
        activity_id: act1.id,
        staff_id: admin.id,
        type: TransactionType.DEDUCTION,
        amount: 350000,
        balance_before: 1000000,
        balance_after: 650000
      });

      const summary = await adminReportService.getDashboardSummary();

      expect(summary.total_participants).toBe(2);
      expect(summary.active_participants).toBe(1);
      expect(summary.total_allocated_credit).toBe(2000000);
      expect(summary.total_spent_credit).toBe(350000);
      expect(summary.remaining_balance).toBe(1650000);
      expect(summary.total_transactions).toBe(1);
      expect(summary.total_deductions).toBe(1);
      expect(summary.total_refunds).toBe(0);
      expect(summary.total_activities).toBe(2);
      expect(summary.active_activities).toBe(1);
    });

    test('should return zeroed metrics for empty database', async () => {
      const summary = await adminReportService.getDashboardSummary();

      expect(summary.total_participants).toBe(0);
      expect(summary.total_allocated_credit).toBe(0);
      expect(summary.total_spent_credit).toBe(0);
      expect(summary.remaining_balance).toBe(0);
      expect(summary.total_transactions).toBe(0);
    });
  });

  describe('getActivityTransactionsSummary', () => {
    test('should aggregate activity metrics with deductions, refunds, net amount, and share %', async () => {
      const admin = await User.create({
        username: 'rep_admin_2',
        password_hash: 'pass',
        name: 'Supervisor 2',
        role: UserRole.ADMIN
      });

      const actJetski = await Activity.create({
        name: 'Jetski',
        price: 650000,
        status: ActivityStatus.ACTIVE
      });
      const actBanana = await Activity.create({
        name: 'Banana Boat',
        price: 150000,
        status: ActivityStatus.ACTIVE
      });
      const actDonut = await Activity.create({
        name: 'Donut Boat',
        price: 125000,
        status: ActivityStatus.INACTIVE
      });

      const p1 = await Participant.create({
        name: 'Peserta 1',
        qr_code: 'SEPA-P1',
        initial_credit: 1000000,
        current_balance: 350000,
        total_spent: 650000,
        status: ParticipantStatus.ACTIVE
      });
      const p2 = await Participant.create({
        name: 'Peserta 2',
        qr_code: 'SEPA-P2',
        initial_credit: 1000000,
        current_balance: 200000,
        total_spent: 800000,
        status: ParticipantStatus.ACTIVE
      });

      // Deduction 1: p1 on Jetski (650,000)
      const tx1 = await Transaction.create({
        participant_id: p1.id,
        activity_id: actJetski.id,
        staff_id: admin.id,
        type: TransactionType.DEDUCTION,
        amount: 650000,
        balance_before: 1000000,
        balance_after: 350000,
        created_at: new Date('2026-09-22T08:00:00Z')
      });

      // Deduction 2: p2 on Banana Boat (150,000)
      await Transaction.create({
        participant_id: p2.id,
        activity_id: actBanana.id,
        staff_id: admin.id,
        type: TransactionType.DEDUCTION,
        amount: 150000,
        balance_before: 1000000,
        balance_after: 850000,
        created_at: new Date('2026-09-22T08:30:00Z')
      });

      // Refund on tx1 (Jetski: 650,000)
      await Transaction.create({
        participant_id: p1.id,
        activity_id: actJetski.id,
        staff_id: admin.id,
        type: TransactionType.REFUND,
        amount: 650000,
        balance_before: 350000,
        balance_after: 1000000,
        reference_id: tx1.id,
        created_at: new Date('2026-09-22T09:00:00Z')
      });

      // Another deduction: p2 on Jetski (650,000)
      await Transaction.create({
        participant_id: p2.id,
        activity_id: actJetski.id,
        staff_id: admin.id,
        type: TransactionType.DEDUCTION,
        amount: 650000,
        balance_before: 850000,
        balance_after: 200000,
        created_at: new Date('2026-09-22T09:30:00Z')
      });

      const result = await adminReportService.getActivityTransactionsSummary();

      expect(result.summary.total_activities).toBe(3);
      expect(result.summary.total_deductions).toBe(3);
      expect(result.summary.total_refunds).toBe(1);
      expect(result.summary.total_gross_amount).toBe(1450000);
      expect(result.summary.total_refund_amount).toBe(650000);
      expect(result.summary.total_net_amount).toBe(800000);
      expect(result.summary.total_unique_participants).toBe(2);

      const jetskiData = result.activities.find((a) => a.id === actJetski.id);
      expect(jetskiData).toBeDefined();
      expect(jetskiData.name).toBe('Jetski');
      expect(jetskiData.price).toBe(650000);
      expect(jetskiData.deduction_count).toBe(2);
      expect(jetskiData.refund_count).toBe(1);
      expect(jetskiData.gross_amount).toBe(1300000);
      expect(jetskiData.refund_amount).toBe(650000);
      expect(jetskiData.net_amount).toBe(650000);
      expect(jetskiData.unique_participants_count).toBe(2);
      // 650000 / 800000 = 81.25%
      expect(jetskiData.share_percentage).toBe(81.25);

      const bananaData = result.activities.find((a) => a.id === actBanana.id);
      expect(bananaData.net_amount).toBe(150000);
      // 150000 / 800000 = 18.75%
      expect(bananaData.share_percentage).toBe(18.75);

      const donutData = result.activities.find((a) => a.id === actDonut.id);
      expect(donutData.deduction_count).toBe(0);
      expect(donutData.net_amount).toBe(0);
      expect(donutData.share_percentage).toBe(0);
    });

    test('should filter activities by status and transactions by date range', async () => {
      const admin = await User.create({
        username: 'rep_admin_3',
        password_hash: 'pass',
        name: 'Supervisor 3',
        role: UserRole.ADMIN
      });

      const act1 = await Activity.create({
        name: 'Jetski Active',
        price: 650000,
        status: ActivityStatus.ACTIVE
      });
      await Activity.create({
        name: 'Donut Inactive',
        price: 125000,
        status: ActivityStatus.INACTIVE
      });

      const p1 = await Participant.create({
        name: 'Peserta 1',
        qr_code: 'SEPA-P10',
        initial_credit: 1000000,
        current_balance: 350000,
        total_spent: 650000,
        status: ParticipantStatus.ACTIVE
      });

      await Transaction.create({
        participant_id: p1.id,
        activity_id: act1.id,
        staff_id: admin.id,
        type: TransactionType.DEDUCTION,
        amount: 650000,
        balance_before: 1000000,
        balance_after: 350000,
        createdAt: new Date('2026-09-20T08:00:00Z'),
        created_at: new Date('2026-09-20T08:00:00Z')
      });

      // Filter status ACTIVE only
      const activeOnly = await adminReportService.getActivityTransactionsSummary({
        status: ActivityStatus.ACTIVE
      });
      expect(activeOnly.summary.total_activities).toBe(1);
      expect(activeOnly.summary.total_unique_participants).toBe(1);
      expect(activeOnly.activities[0].id).toBe(act1.id);

      // Filter status INACTIVE with no inactive transactions
      const inactiveOnly = await adminReportService.getActivityTransactionsSummary({
        status: ActivityStatus.INACTIVE
      });
      expect(inactiveOnly.summary.total_activities).toBe(1);
      expect(inactiveOnly.summary.total_unique_participants).toBe(0);

      // Filter date range after 2026-09-21
      const dateFiltered = await adminReportService.getActivityTransactionsSummary({
        start_date: '2026-09-21T00:00:00Z'
      });
      expect(dateFiltered.summary.total_deductions).toBe(0);
      expect(dateFiltered.summary.total_net_amount).toBe(0);
      expect(dateFiltered.activities.find((a) => a.id === act1.id).deduction_count).toBe(0);
    });

    test('should handle empty activities and zero net amount without division by zero', async () => {
      const result = await adminReportService.getActivityTransactionsSummary();
      expect(result.summary.total_activities).toBe(0);
      expect(result.summary.total_net_amount).toBe(0);
      expect(result.activities).toEqual([]);
    });
  });
});
