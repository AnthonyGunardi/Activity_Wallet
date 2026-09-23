const { sequelize, Participant, Transaction } = require('../../src/models');
const transferService = require('../../src/services/transferService');
const { ParticipantStatus, TransactionType } = require('../../src/constants/enums');

describe('transferService Unit Tests', () => {
  let sender, recipient, blockedParticipant;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Transaction.destroy({ where: {}, force: true });
    await Participant.destroy({ where: {}, force: true });

    sender = await Participant.create({
      name: 'Andi Sender',
      qr_code: 'SEPA-SENDER-01',
      initial_credit: 1000000,
      current_balance: 500000,
      total_spent: 500000,
      status: ParticipantStatus.ACTIVE
    });

    recipient = await Participant.create({
      name: 'Budi Recipient',
      qr_code: 'SEPA-RECIPIENT-02',
      initial_credit: 1000000,
      current_balance: 200000,
      total_spent: 800000,
      status: ParticipantStatus.ACTIVE
    });

    blockedParticipant = await Participant.create({
      name: 'Charlie Blocked',
      qr_code: 'SEPA-BLOCKED-03',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.BLOCKED
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should successfully execute transfer between active participants and create linked transactions', async () => {
    const result = await transferService.executeTransfer({
      sender_qr_code: sender.qr_code,
      recipient_qr_code: recipient.qr_code,
      amount: 150000,
      notes: 'Transfer untuk jet ski bareng'
    });

    expect(result.transfer).toBeDefined();
    expect(result.transfer.amount).toBe(150000);
    expect(result.transfer.sender_balance).toBe(350000);
    expect(result.transfer.recipient_name).toBe(recipient.name);
    expect(result.transfer.transfer_out_id).toBeDefined();
    expect(result.transfer.transfer_in_id).toBeDefined();

    // Verify balances in database
    const updatedSender = await Participant.findByPk(sender.id);
    const updatedRecipient = await Participant.findByPk(recipient.id);
    expect(updatedSender.current_balance).toBe(350000);
    expect(updatedSender.total_spent).toBe(500000); // total_spent unchanged
    expect(updatedRecipient.current_balance).toBe(350000);
    expect(updatedRecipient.total_spent).toBe(800000);

    // Verify Transaction records
    const txOut = await Transaction.findByPk(result.transfer.transfer_out_id);
    const txIn = await Transaction.findByPk(result.transfer.transfer_in_id);

    expect(txOut.type).toBe(TransactionType.TRANSFER_OUT);
    expect(txOut.participant_id).toBe(sender.id);
    expect(txOut.amount).toBe(150000);
    expect(txOut.balance_before).toBe(500000);
    expect(txOut.balance_after).toBe(350000);
    expect(txOut.staff_id).toBeNull();
    expect(txOut.notes).toContain('Budi Recipient');

    expect(txIn.type).toBe(TransactionType.TRANSFER_IN);
    expect(txIn.participant_id).toBe(recipient.id);
    expect(txIn.amount).toBe(150000);
    expect(txIn.balance_before).toBe(200000);
    expect(txIn.balance_after).toBe(350000);
    expect(txIn.staff_id).toBeNull();
    expect(txIn.reference_id).toBe(txOut.id);
    expect(txIn.notes).toContain('Andi Sender');
  });

  test('should reject self-transfer with SELF_TRANSFER_NOT_ALLOWED', async () => {
    await expect(
      transferService.executeTransfer({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: sender.qr_code,
        amount: 50000
      })
    ).rejects.toMatchObject({
      code: 'SELF_TRANSFER_NOT_ALLOWED',
      statusCode: 400
    });
  });

  test('should reject transfer when sender has insufficient balance with INSUFFICIENT_BALANCE (422)', async () => {
    await expect(
      transferService.executeTransfer({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: recipient.qr_code,
        amount: 600000 // exceeds sender 500000
      })
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_BALANCE',
      statusCode: 422
    });
  });

  test('should reject transfer when sender does not exist with SENDER_NOT_FOUND (404)', async () => {
    await expect(
      transferService.executeTransfer({
        sender_qr_code: 'SEPA-GHOST',
        recipient_qr_code: recipient.qr_code,
        amount: 50000
      })
    ).rejects.toMatchObject({
      code: 'SENDER_NOT_FOUND',
      statusCode: 404
    });
  });

  test('should reject transfer when recipient does not exist with RECIPIENT_NOT_FOUND (404)', async () => {
    await expect(
      transferService.executeTransfer({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: 'SEPA-GHOST',
        amount: 50000
      })
    ).rejects.toMatchObject({
      code: 'RECIPIENT_NOT_FOUND',
      statusCode: 404
    });
  });

  test('should reject transfer when sender is blocked with SENDER_BLOCKED (403)', async () => {
    await expect(
      transferService.executeTransfer({
        sender_qr_code: blockedParticipant.qr_code,
        recipient_qr_code: recipient.qr_code,
        amount: 50000
      })
    ).rejects.toMatchObject({
      code: 'SENDER_BLOCKED',
      statusCode: 403
    });
  });

  test('should reject transfer when recipient is blocked with RECIPIENT_BLOCKED (403)', async () => {
    await expect(
      transferService.executeTransfer({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: blockedParticipant.qr_code,
        amount: 50000
      })
    ).rejects.toMatchObject({
      code: 'RECIPIENT_BLOCKED',
      statusCode: 403
    });
  });
});
