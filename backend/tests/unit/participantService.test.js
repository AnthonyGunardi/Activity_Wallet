const { sequelize, Participant, Activity, Transaction, User } = require('../../src/models');
const participantService = require('../../src/services/participantService');
const { ParticipantStatus, ActivityStatus, TransactionType, UserRole } = require('../../src/constants/enums');

describe('Participant Service Unit Tests', () => {
  let activeParticipant;
  let jetSki, bananaBoat, inactiveActivity;
  let staffUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    staffUser = await User.create({
      username: 'unit_staff_p',
      password_hash: 'staffpass',
      name: 'Unit Staff',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });

    activeParticipant = await Participant.create({
      name: 'Budi Santoso',
      qr_code: 'SEPA-TEST-001',
      initial_credit: 1000000,
      current_balance: 750000,
      total_spent: 250000,
      status: ParticipantStatus.ACTIVE
    });

    await Participant.create({
      name: 'Siti Rahma',
      qr_code: 'SEPA-TEST-BLOCKED',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.BLOCKED
    });

    await Participant.create({
      name: 'Eko Prasetyo',
      qr_code: 'SEPA-TEST-LOW',
      initial_credit: 1000000,
      current_balance: 100000,
      total_spent: 900000,
      status: ParticipantStatus.ACTIVE
    });

    jetSki = await Activity.create({
      name: 'Jet Ski',
      price: 350000,
      description: '15 menit mengendarai jet ski',
      status: ActivityStatus.ACTIVE
    });

    bananaBoat = await Activity.create({
      name: 'Banana Boat',
      price: 150000,
      description: '15 menit bermain banana boat',
      status: ActivityStatus.ACTIVE
    });

    inactiveActivity = await Activity.create({
      name: 'Parasailing Inactive',
      price: 500000,
      description: 'Aktivitas nonaktif',
      status: ActivityStatus.INACTIVE
    });

    await Transaction.create({
      participant_id: activeParticipant.id,
      activity_id: bananaBoat.id,
      staff_id: staffUser.id,
      type: TransactionType.DEDUCTION,
      amount: 150000,
      balance_before: 1000000,
      balance_after: 850000,
      notes: 'Pembayaran Banana Boat',
      created_at: new Date(Date.now() - 10000)
    });

    await Transaction.create({
      participant_id: activeParticipant.id,
      activity_id: null,
      staff_id: staffUser.id,
      type: TransactionType.DEDUCTION,
      amount: 100000,
      balance_before: 850000,
      balance_after: 750000,
      notes: 'Sewa Handuk & Loker',
      created_at: new Date()
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('getWalletByQrCode', () => {
    test('should return wallet details, active activities with affordability, and recent transactions', async () => {
      const wallet = await participantService.getWalletByQrCode('SEPA-TEST-001');

      expect(wallet).toHaveProperty('participant');
      expect(wallet.participant).toEqual({
        id: activeParticipant.id,
        name: 'Budi Santoso',
        qr_code: 'SEPA-TEST-001',
        initial_credit: 1000000,
        current_balance: 750000,
        total_spent: 250000,
        status: ParticipantStatus.ACTIVE
      });

      expect(wallet).toHaveProperty('activities');
      expect(wallet.activities.length).toBe(2);
      expect(wallet.activities.find((a) => a.id === inactiveActivity.id)).toBeUndefined();

      const js = wallet.activities.find((a) => a.id === jetSki.id);
      expect(js).toBeDefined();
      expect(js.is_affordable).toBe(true); // 750000 >= 350000

      const bb = wallet.activities.find((a) => a.id === bananaBoat.id);
      expect(bb).toBeDefined();
      expect(bb.is_affordable).toBe(true); // 750000 >= 150000

      expect(wallet).toHaveProperty('recent_transactions');
      expect(wallet.recent_transactions.length).toBe(2);
      expect(wallet.recent_transactions[0].notes).toBe('Sewa Handuk & Loker');
      expect(wallet.recent_transactions[0].activity_name).toBeNull();
      expect(wallet.recent_transactions[1].activity_name).toBe('Banana Boat');
    });

    test('should accurately calculate is_affordable = false when participant has insufficient balance', async () => {
      const wallet = await participantService.getWalletByQrCode('SEPA-TEST-LOW');

      expect(wallet.participant.current_balance).toBe(100000);
      const js = wallet.activities.find((a) => a.id === jetSki.id);
      expect(js.is_affordable).toBe(false); // 100000 < 350000

      const bb = wallet.activities.find((a) => a.id === bananaBoat.id);
      expect(bb.is_affordable).toBe(false); // 100000 < 150000
    });

    test('should throw AppError 404 when QR code is not found', async () => {
      await expect(participantService.getWalletByQrCode('NON-EXISTENT-QR')).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });

    test('should throw AppError 403 when participant is BLOCKED', async () => {
      await expect(participantService.getWalletByQrCode('SEPA-TEST-BLOCKED')).rejects.toMatchObject({
        statusCode: 403,
        code: 'PARTICIPANT_BLOCKED'
      });
    });
  });
});
