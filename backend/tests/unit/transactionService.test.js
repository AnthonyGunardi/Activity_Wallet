const { sequelize, Participant, Activity, Transaction, User } = require('../../src/models');
const transactionService = require('../../src/services/transactionService');
const { ParticipantStatus, ActivityStatus, TransactionType, UserRole } = require('../../src/constants/enums');

describe('Transaction Service Unit Tests', () => {
  let staffUser, activeParticipant, lowBalanceParticipant;
  let jetSki, bananaBoat, inactiveActivity;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    staffUser = await User.create({
      username: 'unit_booth_staff',
      password_hash: 'staffpass',
      name: 'Booth Staff 1',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });

    activeParticipant = await Participant.create({
      name: 'Ahmad Fauzi',
      qr_code: 'SEPA-BOOTH-001',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.ACTIVE
    });

    await Participant.create({
      name: 'Rina Nose',
      qr_code: 'SEPA-BOOTH-BLOCKED',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.BLOCKED
    });

    lowBalanceParticipant = await Participant.create({
      name: 'Doni Pratama',
      qr_code: 'SEPA-BOOTH-LOW',
      initial_credit: 1000000,
      current_balance: 100000,
      total_spent: 900000,
      status: ParticipantStatus.ACTIVE
    });

    jetSki = await Activity.create({
      name: 'Jet Ski Booth',
      price: 350000,
      description: '15 menit',
      status: ActivityStatus.ACTIVE
    });

    bananaBoat = await Activity.create({
      name: 'Banana Boat Booth',
      price: 150000,
      description: '15 menit',
      status: ActivityStatus.ACTIVE
    });

    inactiveActivity = await Activity.create({
      name: 'Scuba Diving Booth Inactive',
      price: 600000,
      description: 'Nonaktif',
      status: ActivityStatus.INACTIVE
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('scanParticipant', () => {
    test('should lookup participant and list active activities with affordability flags', async () => {
      const result = await transactionService.scanParticipant('SEPA-BOOTH-001');

      expect(result.participant.id).toBe(activeParticipant.id);
      expect(result.participant.name).toBe('Ahmad Fauzi');
      expect(result.participant.current_balance).toBe(1000000);

      expect(Array.isArray(result.eligible_activities)).toBe(true);
      expect(result.eligible_activities.length).toBe(2);

      const js = result.eligible_activities.find((a) => a.id === jetSki.id);
      expect(js.is_affordable).toBe(true);
    });

    test('should throw 404 when QR code is not registered', async () => {
      await expect(transactionService.scanParticipant('NON-EXISTENT')).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });

    test('should throw 403 when participant is BLOCKED', async () => {
      await expect(transactionService.scanParticipant('SEPA-BOOTH-BLOCKED')).rejects.toMatchObject({
        statusCode: 403,
        code: 'PARTICIPANT_BLOCKED'
      });
    });
  });

  describe('processDeduction', () => {
    test('should deduct balance atomically and create immutable Transaction record', async () => {
      const result = await transactionService.processDeduction({
        qr_code: 'SEPA-BOOTH-001',
        activity_id: jetSki.id,
        staff_id: staffUser.id,
        notes: 'Deduction for Jet Ski'
      });

      expect(result).toHaveProperty('transaction');
      expect(result.transaction.amount).toBe(350000);
      expect(result.transaction.type).toBe(TransactionType.DEDUCTION);
      expect(result.transaction.balance_before).toBe(1000000);
      expect(result.transaction.balance_after).toBe(650000);
      expect(result.updated_balance).toBe(650000);

      // Verify DB persistence
      const p = await Participant.findByPk(activeParticipant.id);
      expect(p.current_balance).toBe(650000);
      expect(p.total_spent).toBe(350000);

      const tx = await Transaction.findByPk(result.transaction.id);
      expect(tx).not.toBeNull();
      expect(tx.notes).toBe('Deduction for Jet Ski');
    });

    test('should reject deduction with 422 INSUFFICIENT_BALANCE if price exceeds balance', async () => {
      await expect(
        transactionService.processDeduction({
          qr_code: 'SEPA-BOOTH-LOW',
          activity_id: jetSki.id, // price 350000 > balance 100000
          staff_id: staffUser.id
        })
      ).rejects.toMatchObject({
        statusCode: 422,
        code: 'INSUFFICIENT_BALANCE'
      });

      // Verify balance was untouched
      const p = await Participant.findByPk(lowBalanceParticipant.id);
      expect(p.current_balance).toBe(100000);
    });

    test('should reject deduction with 403 if participant is BLOCKED', async () => {
      await expect(
        transactionService.processDeduction({
          qr_code: 'SEPA-BOOTH-BLOCKED',
          activity_id: bananaBoat.id,
          staff_id: staffUser.id
        })
      ).rejects.toMatchObject({
        statusCode: 403,
        code: 'PARTICIPANT_BLOCKED'
      });
    });

    test('should reject deduction with 404 if activity not found', async () => {
      await expect(
        transactionService.processDeduction({
          qr_code: 'SEPA-BOOTH-001',
          activity_id: '00000000-0000-0000-0000-000000000000',
          staff_id: staffUser.id
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'ACTIVITY_NOT_FOUND'
      });
    });

    test('should reject deduction with 404 if participant is not found during deduction transaction', async () => {
      await expect(
        transactionService.processDeduction({
          qr_code: 'NON_EXISTENT_QR',
          activity_id: jetSki.id,
          staff_id: staffUser.id
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });

    test('should reject deduction with 422 if activity is INACTIVE', async () => {
      await expect(
        transactionService.processDeduction({
          qr_code: 'SEPA-BOOTH-001',
          activity_id: inactiveActivity.id,
          staff_id: staffUser.id
        })
      ).rejects.toMatchObject({
        statusCode: 422,
        code: 'ACTIVITY_INACTIVE'
      });
    });
  });

  describe('getRecentStaffTransactions', () => {
    test('should return recent transactions executed by the staff member', async () => {
      const recent = await transactionService.getRecentStaffTransactions(staffUser.id);
      expect(Array.isArray(recent)).toBe(true);
      expect(recent.length).toBeGreaterThanOrEqual(1);
      expect(recent[0].activity_name).toBe('Jet Ski Booth');
    });

    test('should handle transactions where activity or participant relation is missing', async () => {
      const orphanTx = await Transaction.create({
        participant_id: activeParticipant.id,
        staff_id: staffUser.id,
        type: TransactionType.ADJUSTMENT,
        amount: 50000,
        balance_before: 500000,
        balance_after: 550000,
        notes: 'Manual Adjustment'
      });

      const recent = await transactionService.getRecentStaffTransactions(staffUser.id);
      const foundOrphan = recent.find((r) => r.id === orphanTx.id);
      expect(foundOrphan).toBeDefined();
      expect(foundOrphan.activity_name).toBeNull();
    });
  });
});
