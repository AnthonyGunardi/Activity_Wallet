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
});
