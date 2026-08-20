const { sequelize, User, Participant, Activity, Transaction } = require('../../src/models');
const { UserRole, ParticipantStatus, ActivityStatus, TransactionType } = require('../../src/constants/enums');
const refundService = require('../../src/services/refundService');
const { AppError } = require('../../src/utils/responseEnvelope');

describe('RefundService Unit Tests', () => {
  let adminUser, testParticipant, testActivity, deductionTx;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    adminUser = await User.create({
      username: 'unit_admin_refund',
      password_hash: 'hashpass',
      name: 'Admin Supervisor',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });

    testActivity = await Activity.create({
      name: 'Snorkeling Package',
      price: 200000,
      status: ActivityStatus.ACTIVE
    });
  });

  beforeEach(async () => {
    await Transaction.destroy({ where: {}, truncate: true });
    await Participant.destroy({ where: {}, truncate: true });

    testParticipant = await Participant.create({
      name: 'Dimas Anggara',
      qr_code: 'SEPA-REFUND-001',
      initial_credit: 1000000,
      current_balance: 800000,
      total_spent: 200000,
      status: ParticipantStatus.ACTIVE
    });

    deductionTx = await Transaction.create({
      participant_id: testParticipant.id,
      activity_id: testActivity.id,
      staff_id: adminUser.id,
      type: TransactionType.DEDUCTION,
      amount: 200000,
      balance_before: 1000000,
      balance_after: 800000,
      notes: 'Initial test deduction'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('processRefund', () => {
    test('should refund a valid deduction and atomically restore participant balance', async () => {
      const result = await refundService.processRefund({
        transaction_id: deductionTx.id,
        staff_id: adminUser.id,
        notes: 'Accidental double tap refund'
      });

      expect(result).toBeDefined();
      expect(result.refund_transaction).toBeDefined();
      expect(result.refund_transaction.type).toBe(TransactionType.REFUND);
      expect(result.refund_transaction.amount).toBe(200000);
      expect(result.refund_transaction.balance_before).toBe(800000);
      expect(result.refund_transaction.balance_after).toBe(1000000);
      expect(result.refund_transaction.reference_id).toBe(deductionTx.id);
      expect(result.restored_balance).toBe(1000000);

      // Verify participant in DB
      const updatedParticipant = await Participant.findByPk(testParticipant.id);
      expect(updatedParticipant.current_balance).toBe(1000000);
      expect(updatedParticipant.total_spent).toBe(0);
    });

    test('should throw 404 TRANSACTION_NOT_FOUND for non-existent transaction', async () => {
      await expect(
        refundService.processRefund({
          transaction_id: '00000000-0000-0000-0000-000000000000',
          staff_id: adminUser.id
        })
      ).rejects.toThrow(AppError);

      try {
        await refundService.processRefund({
          transaction_id: '00000000-0000-0000-0000-000000000000',
          staff_id: adminUser.id
        });
      } catch (err) {
        expect(err.statusCode).toBe(404);
        expect(err.code).toBe('TRANSACTION_NOT_FOUND');
      }
    });

    test('should throw 422 ALREADY_REFUNDED when trying to refund the same deduction twice', async () => {
      await refundService.processRefund({
        transaction_id: deductionTx.id,
        staff_id: adminUser.id,
        notes: 'First refund'
      });

      await expect(
        refundService.processRefund({
          transaction_id: deductionTx.id,
          staff_id: adminUser.id,
          notes: 'Second duplicate refund attempt'
        })
      ).rejects.toThrow(AppError);

      try {
        await refundService.processRefund({
          transaction_id: deductionTx.id,
          staff_id: adminUser.id
        });
      } catch (err) {
        expect(err.statusCode).toBe(422);
        expect(err.code).toBe('ALREADY_REFUNDED');
      }
    });

    test('should throw 422 INVALID_TRANSACTION_TYPE when attempting to refund a non-deduction record', async () => {
      const refundTx = await refundService.processRefund({
        transaction_id: deductionTx.id,
        staff_id: adminUser.id
      });

      await expect(
        refundService.processRefund({
          transaction_id: refundTx.refund_transaction.id,
          staff_id: adminUser.id
        })
      ).rejects.toThrow(AppError);

      try {
        await refundService.processRefund({
          transaction_id: refundTx.refund_transaction.id,
          staff_id: adminUser.id
        });
      } catch (err) {
        expect(err.statusCode).toBe(422);
        expect(err.code).toBe('INVALID_TRANSACTION_TYPE');
      }
    });
  });

  describe('listTransactions', () => {
    test('should list all transactions with pagination and associations', async () => {
      const result = await refundService.listTransactions({ page: 1, limit: 10 });
      expect(result.transactions.length).toBe(1);
      expect(result.pagination.total).toBe(1);
      expect(result.transactions[0].participant).toBeDefined();
      expect(result.transactions[0].activity).toBeDefined();
    });

    test('should filter transactions by transaction type', async () => {
      await refundService.processRefund({
        transaction_id: deductionTx.id,
        staff_id: adminUser.id
      });

      const refundOnly = await refundService.listTransactions({ type: TransactionType.REFUND });
      expect(refundOnly.transactions.length).toBe(1);
      expect(refundOnly.transactions[0].type).toBe(TransactionType.REFUND);

      const deductionOnly = await refundService.listTransactions({ type: TransactionType.DEDUCTION });
      expect(deductionOnly.transactions.length).toBe(1);
      expect(deductionOnly.transactions[0].type).toBe(TransactionType.DEDUCTION);
    });

    test('should filter transactions by participant_id, activity_id, staff_id, date range and search', async () => {
      const filtered = await refundService.listTransactions({
        participant_id: testParticipant.id,
        activity_id: testActivity.id,
        staff_id: adminUser.id,
        start_date: '2020-01-01',
        end_date: '2030-12-31',
        search: 'Dimas'
      });
      expect(filtered.transactions.length).toBeGreaterThanOrEqual(1);

      const emptySearch = await refundService.listTransactions({ search: 'NonExistent' });
      expect(emptySearch.transactions.length).toBe(0);
    });

    test('should throw 404 PARTICIPANT_NOT_FOUND when participant is missing', async () => {
      const origFindByPk = Participant.findByPk;
      jest.spyOn(Participant, 'findByPk').mockResolvedValueOnce(null);

      await expect(
        refundService.processRefund({
          transaction_id: deductionTx.id,
          staff_id: adminUser.id
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });

      Participant.findByPk.mockRestore();
    });
  });
});
