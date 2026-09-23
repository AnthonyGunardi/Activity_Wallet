const { sequelize, User, Participant, Activity, Transaction, setupModels } = require('../../src/models');
const { hashPasswordHook } = require('../../src/models/User');
const { UserRole, ParticipantStatus, ActivityStatus, TransactionType } = require('../../src/constants/enums');

describe('Sequelize Domain Models Unit Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('User Model', () => {
    test('should create user and hash plaintext password', async () => {
      const user = await User.create({
        username: 'test_staff',
        password_hash: 'secretpassword',
        name: 'Test Staff',
        role: UserRole.STAFF
      });

      expect(user.id).toBeDefined();
      expect(user.password_hash).not.toBe('secretpassword');
      expect(user.password_hash.startsWith('$2')).toBe(true);

      const isMatch = await user.comparePassword('secretpassword');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    test('should comparePassword return false if password_hash or candidate is not set', async () => {
      const emptyUser = new User();
      expect(await emptyUser.comparePassword('pass')).toBe(false);

      const validUser = new User({ password_hash: '$2a$10$xyz' });
      expect(await validUser.comparePassword('')).toBe(false);
    });

    test('hashPasswordHook should not re-hash if already bcrypt formatted', async () => {
      const alreadyHashed = '$2a$10$abcdefghijklmnopqrstuvwxyz01234567890123456789012345';
      const user = { password_hash: alreadyHashed };
      await hashPasswordHook(user);
      expect(user.password_hash).toBe(alreadyHashed);
    });

    test('hashPasswordHook should do nothing if password_hash is empty', async () => {
      const user = { password_hash: null };
      await hashPasswordHook(user);
      expect(user.password_hash).toBeNull();
    });

    test('should rehash password on update when changed', async () => {
      const user = await User.create({
        username: 'update_user',
        password_hash: 'initialpassword',
        name: 'Update User',
        role: UserRole.STAFF
      });

      user.password_hash = 'newpassword';
      await user.save();

      const isMatch = await user.comparePassword('newpassword');
      expect(isMatch).toBe(true);
    });

    test('should not rehash password on update when password_hash is unchanged', async () => {
      const user = await User.create({
        username: 'name_updater',
        password_hash: 'samepassword',
        name: 'Original Name',
        role: UserRole.STAFF
      });

      const originalHash = user.password_hash;
      user.name = 'Updated Name';
      await user.save();

      expect(user.password_hash).toBe(originalHash);
    });

    test('should reject duplicate username', async () => {
      await expect(
        User.create({
          username: 'test_staff',
          password_hash: 'anotherpassword',
          name: 'Duplicate Staff',
          role: UserRole.STAFF
        })
      ).rejects.toThrow();
    });
  });

  describe('Participant Model', () => {
    test('should create participant with 1.000.000 starting credit and balance by default', async () => {
      const participant = await Participant.create({
        name: 'John Doe',
        qr_code: 'SEPA-TEST-001'
      });

      expect(participant.id).toBeDefined();
      expect(participant.initial_credit).toBe(1000000);
      expect(participant.current_balance).toBe(1000000);
      expect(participant.total_spent).toBe(0);
      expect(participant.status).toBe(ParticipantStatus.ACTIVE);
    });

    test('should reject duplicate qr_code', async () => {
      await expect(
        Participant.create({
          name: 'Jane Doe',
          qr_code: 'SEPA-TEST-001'
        })
      ).rejects.toThrow();
    });

    test('should validate non-negative balance and total_spent', async () => {
      await expect(
        Participant.create({
          name: 'Negative Tester',
          qr_code: 'SEPA-TEST-NEG',
          current_balance: -500
        })
      ).rejects.toThrow();
    });
  });

  describe('Activity Model', () => {
    test('should create activity with name, price, and default active status', async () => {
      const activity = await Activity.create({
        name: 'Jet Ski Special',
        price: 350000,
        description: 'Special Jet Ski Ride'
      });

      expect(activity.id).toBeDefined();
      expect(activity.name).toBe('Jet Ski Special');
      expect(activity.price).toBe(350000);
      expect(activity.status).toBe(ActivityStatus.ACTIVE);
    });

    test('should reject duplicate activity name', async () => {
      await expect(
        Activity.create({
          name: 'Jet Ski Special',
          price: 400000
        })
      ).rejects.toThrow();
    });

    test('should reject negative price', async () => {
      await expect(
        Activity.create({
          name: 'Negative Activity',
          price: -100
        })
      ).rejects.toThrow();
    });
  });

  describe('Transaction Model & Ledger Invariants', () => {
    let participant, activity, staff;

    beforeAll(async () => {
      participant = await Participant.create({
        name: 'Tx Participant',
        qr_code: 'SEPA-TX-001'
      });

      activity = await Activity.create({
        name: 'Tx Banana Boat',
        price: 150000
      });

      staff = await User.create({
        username: 'tx_staff',
        password_hash: 'staffpass',
        name: 'Tx Staff',
        role: UserRole.STAFF
      });
    });

    test('should create immutable transaction record', async () => {
      const tx = await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        amount: 150000,
        balance_before: 1000000,
        balance_after: 850000,
        notes: 'Deduction test'
      });

      expect(tx.id).toBeDefined();
      expect(tx.amount).toBe(150000);
      expect(tx.balance_after).toBe(850000);
      expect(tx.created_at).toBeDefined();
    });

    test('should throw error when attempting to update a Transaction (Immutable Invariant)', async () => {
      const tx = await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        amount: 150000,
        balance_before: 850000,
        balance_after: 700000
      });

      tx.notes = 'Attempted update';
      await expect(tx.save()).rejects.toThrow('IMMUTABLE_LEDGER_VIOLATION: Transaction records cannot be updated.');
    });

    test('should throw error when attempting to delete a Transaction (Immutable Invariant)', async () => {
      const tx = await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        amount: 150000,
        balance_before: 700000,
        balance_after: 550000
      });

      await expect(tx.destroy()).rejects.toThrow('IMMUTABLE_LEDGER_VIOLATION: Transaction records cannot be deleted.');
    });

    test('should support self-referencing refund transaction association', async () => {
      const originalTx = await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.DEDUCTION,
        amount: 150000,
        balance_before: 550000,
        balance_after: 400000
      });

      const refundTx = await Transaction.create({
        participant_id: participant.id,
        activity_id: activity.id,
        staff_id: staff.id,
        type: TransactionType.REFUND,
        amount: 150000,
        balance_before: 400000,
        balance_after: 550000,
        reference_id: originalTx.id,
        notes: 'Authorized refund'
      });

      const fetchedRefund = await Transaction.findByPk(refundTx.id, {
        include: [
          { model: Transaction, as: 'reference_transaction' },
          { model: Participant, as: 'participant' },
          { model: Activity, as: 'activity' },
          { model: User, as: 'staff' }
        ]
      });

      expect(fetchedRefund.reference_transaction).toBeDefined();
      expect(fetchedRefund.reference_transaction.id).toBe(originalTx.id);
      expect(fetchedRefund.participant.id).toBe(participant.id);
      expect(fetchedRefund.activity.id).toBe(activity.id);
      expect(fetchedRefund.staff.id).toBe(staff.id);
    });

    test('setupModels should work with default parameter', () => {
      const defaultSetup = setupModels();
      expect(defaultSetup.User).toBeDefined();
      expect(defaultSetup.Participant).toBeDefined();
      expect(defaultSetup.Activity).toBeDefined();
      expect(defaultSetup.Transaction).toBeDefined();
    });
  });
});
