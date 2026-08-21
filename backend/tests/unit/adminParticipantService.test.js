const { sequelize, Participant, User, Transaction } = require('../../src/models');
const adminParticipantService = require('../../src/services/adminParticipantService');
const { ParticipantStatus, UserRole } = require('../../src/constants/enums');

describe('Admin Participant Service Unit Tests', () => {
  let participant1, participant2, blockedParticipant;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const admin = await User.create({
      username: 'unit_admin_p',
      password_hash: 'adminpass',
      name: 'Admin Tester',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    });

    participant1 = await Participant.create({
      name: 'Budi Handoko',
      qr_code: 'SEPA-ADM-001',
      initial_credit: 1000000,
      current_balance: 750000,
      total_spent: 250000,
      status: ParticipantStatus.ACTIVE
    });

    participant2 = await Participant.create({
      name: 'Siti Aminah',
      qr_code: 'SEPA-ADM-002',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.ACTIVE
    });

    blockedParticipant = await Participant.create({
      name: 'Zulkifli Hasan',
      qr_code: 'SEPA-ADM-003',
      initial_credit: 1000000,
      current_balance: 500000,
      total_spent: 500000,
      status: ParticipantStatus.BLOCKED
    });

    // Create a transaction on participant1 for testing deletion safeguard
    await Transaction.create({
      participant_id: participant1.id,
      staff_id: admin.id,
      type: 'DEDUCTION',
      amount: 250000,
      balance_before: 1000000,
      balance_after: 750000,
      created_at: new Date()
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('listParticipants', () => {
    test('should list participants with pagination metadata', async () => {
      const result = await adminParticipantService.listParticipants({ page: 1, limit: 10 });
      expect(result).toHaveProperty('participants');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.total).toBe(3);
      expect(result.participants.length).toBe(3);
    });

    test('should filter participants by search keyword (name or QR)', async () => {
      const resultName = await adminParticipantService.listParticipants({ search: 'Handoko' });
      expect(resultName.participants.length).toBe(1);
      expect(resultName.participants[0].name).toBe('Budi Handoko');

      const resultQr = await adminParticipantService.listParticipants({ search: 'ADM-002' });
      expect(resultQr.participants.length).toBe(1);
      expect(resultQr.participants[0].name).toBe('Siti Aminah');
    });

    test('should filter participants by status', async () => {
      const resultBlocked = await adminParticipantService.listParticipants({ status: ParticipantStatus.BLOCKED });
      expect(resultBlocked.participants.length).toBe(1);
      expect(resultBlocked.participants[0].name).toBe('Zulkifli Hasan');
    });
  });

  describe('getParticipantById', () => {
    test('should retrieve participant details with transaction history', async () => {
      const found = await adminParticipantService.getParticipantById(participant1.id);
      expect(found).toBeDefined();
      expect(found.name).toBe('Budi Handoko');
      expect(found.transactions).toBeDefined();
      expect(found.transactions.length).toBe(1);
    });

    test('should throw 404 when participant ID does not exist', async () => {
      await expect(
        adminParticipantService.getParticipantById('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });
  });

  describe('updateParticipant', () => {
    test('should update participant name and status', async () => {
      const updated = await adminParticipantService.updateParticipant(participant2.id, {
        name: 'Siti Aminah Updated',
        status: ParticipantStatus.BLOCKED
      });
      expect(updated.name).toBe('Siti Aminah Updated');
      expect(updated.status).toBe(ParticipantStatus.BLOCKED);

      // Revert back for other tests
      await adminParticipantService.updateParticipant(participant2.id, {
        status: ParticipantStatus.ACTIVE
      });
    });

    test('should throw 404 when updating non-existent participant', async () => {
      await expect(
        adminParticipantService.updateParticipant('00000000-0000-0000-0000-000000000000', { name: 'Ghost' })
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });
  });

  describe('deleteParticipant', () => {
    test('should reject deletion of participant with existing transactions with 422', async () => {
      await expect(
        adminParticipantService.deleteParticipant(participant1.id)
      ).rejects.toMatchObject({
        statusCode: 422,
        code: 'CANNOT_DELETE_PARTICIPANT_WITH_TRANSACTIONS'
      });
    });

    test('should throw 404 when deleting non-existent participant', async () => {
      await expect(
        adminParticipantService.deleteParticipant('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });

    test('should safely delete participant who has 0 transactions', async () => {
      const tempParticipant = await Participant.create({
        name: 'Temporary Unused Participant',
        qr_code: 'SEPA-TEMP-DEL',
        initial_credit: 1000000,
        current_balance: 1000000,
        total_spent: 0,
        status: ParticipantStatus.ACTIVE
      });

      const res = await adminParticipantService.deleteParticipant(tempParticipant.id);
      expect(res.deleted).toBe(true);

      const check = await Participant.findByPk(tempParticipant.id);
      expect(check).toBeNull();
    });
  });

  describe('createParticipant & bulkCreate', () => {
    test('should create a single participant and auto-generate QR code if omitted', async () => {
      const created = await adminParticipantService.createParticipant({
        name: 'Dedi Corbuzier'
      });

      expect(created.name).toBe('Dedi Corbuzier');
      expect(created.initial_credit).toBe(1000000);
      expect(created.current_balance).toBe(1000000);
      expect(created.qr_code).toMatch(/^SEPA-/);
    });

    test('should bulk create participants in a managed transaction', async () => {
      const bulkList = [
        { name: 'Bulk User 1' },
        { name: 'Bulk User 2', qr_code: 'SEPA-CUSTOM-BULK-2' }
      ];

      const result = await adminParticipantService.bulkCreateParticipants(bulkList);
      expect(result.created_count).toBe(2);
      expect(result.participants.length).toBe(2);

      const found = await Participant.findOne({ where: { qr_code: 'SEPA-CUSTOM-BULK-2' } });
      expect(found).not.toBeNull();
      expect(found.name).toBe('Bulk User 2');
    });
  });

  describe('reissueQrCode', () => {
    test('should update participant QR code while strictly preserving balance and history', async () => {
      const oldQr = participant1.qr_code;
      const oldBalance = participant1.current_balance;

      const result = await adminParticipantService.reissueQrCode(participant1.id);

      expect(result.previous_qr_code).toBe(oldQr);
      expect(result.new_qr_code).not.toBe(oldQr);
      expect(result.participant.current_balance).toBe(oldBalance);

      const refreshed = await Participant.findByPk(participant1.id);
      expect(refreshed.qr_code).toBe(result.new_qr_code);
      expect(refreshed.current_balance).toBe(oldBalance);
    });

    test('should throw 404 when participant ID does not exist', async () => {
      await expect(
        adminParticipantService.reissueQrCode('00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });
  });

  describe('updateParticipantStatus', () => {
    test('should block an active participant', async () => {
      const updated = await adminParticipantService.updateParticipantStatus(
        participant2.id,
        ParticipantStatus.BLOCKED
      );
      expect(updated.status).toBe(ParticipantStatus.BLOCKED);
    });

    test('should unblock a blocked participant', async () => {
      const updated = await adminParticipantService.updateParticipantStatus(
        blockedParticipant.id,
        ParticipantStatus.ACTIVE
      );
      expect(updated.status).toBe(ParticipantStatus.ACTIVE);
    });

    test('should throw 404 when participant ID does not exist', async () => {
      await expect(
        adminParticipantService.updateParticipantStatus('00000000-0000-0000-0000-000000000000', ParticipantStatus.ACTIVE)
      ).rejects.toMatchObject({
        statusCode: 404,
        code: 'PARTICIPANT_NOT_FOUND'
      });
    });
  });

  describe('createParticipant branches', () => {
    test('should create participant with custom initial credit and custom QR code', async () => {
      const created = await adminParticipantService.createParticipant({
        name: 'Custom User',
        initial_credit: 500000,
        qr_code: 'SEPA-CUSTOM-999'
      });

      expect(created.initial_credit).toBe(500000);
      expect(created.current_balance).toBe(500000);
      expect(created.qr_code).toBe('SEPA-CUSTOM-999');
    });

    test('should handle while loop when token collision occurs in generateQrToken', async () => {
      const origFindOne = Participant.findOne;
      let callCount = 0;
      jest.spyOn(Participant, 'findOne').mockImplementation(async (opts) => {
        if (opts?.where?.qr_code && callCount === 0) {
          callCount++;
          return { id: 'existing-id' };
        }
        return origFindOne.call(Participant, opts);
      });

      const p = await adminParticipantService.createParticipant({ name: 'Collision Participant' });
      expect(p).toBeDefined();
      Participant.findOne.mockRestore();
    });

    test('should handle while loop in reissueQrCode collision', async () => {
      const origFindOne = Participant.findOne;
      let callCount = 0;
      jest.spyOn(Participant, 'findOne').mockImplementation(async (opts) => {
        if (opts?.where?.qr_code && opts.where.qr_code.startsWith('SEPA-REISSUE') && callCount === 0) {
          callCount++;
          return { id: 'existing-id' };
        }
        return origFindOne.call(Participant, opts);
      });

      const res = await adminParticipantService.reissueQrCode(participant2.id);
      expect(res.new_qr_code).toBeDefined();
      Participant.findOne.mockRestore();
    });
  });
});
