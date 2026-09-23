const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Participant, Transaction } = require('../../src/models');
const { ParticipantStatus } = require('../../src/constants/enums');

describe('POST /api/v1/participants/transfer Integration Tests', () => {
  let sender, recipient, blockedParticipant;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Transaction.destroy({ where: {}, force: true });
    await Participant.destroy({ where: {}, force: true });

    sender = await Participant.create({
      name: 'Rian Sender',
      qr_code: 'SEPA-RIAN-001',
      initial_credit: 1000000,
      current_balance: 600000,
      total_spent: 400000,
      status: ParticipantStatus.ACTIVE
    });

    recipient = await Participant.create({
      name: 'Siti Recipient',
      qr_code: 'SEPA-SITI-002',
      initial_credit: 1000000,
      current_balance: 100000,
      total_spent: 900000,
      status: ParticipantStatus.ACTIVE
    });

    blockedParticipant = await Participant.create({
      name: 'Doni Blocked',
      qr_code: 'SEPA-DONI-003',
      initial_credit: 1000000,
      current_balance: 500000,
      total_spent: 500000,
      status: ParticipantStatus.BLOCKED
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should return 200 and transfer credit atomically on valid transfer payload', async () => {
    const res = await request(app)
      .post('/api/v1/participants/transfer')
      .send({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: recipient.qr_code,
        amount: 200000,
        notes: 'Transfer makan & main bareng'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transfer).toBeDefined();
    expect(res.body.data.transfer.amount).toBe(200000);
    expect(res.body.data.transfer.sender_balance).toBe(400000);
    expect(res.body.data.transfer.recipient_name).toBe(recipient.name);
  });

  test('should return 400 when attempting self-transfer via payload validation', async () => {
    const res = await request(app)
      .post('/api/v1/participants/transfer')
      .send({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: sender.qr_code,
        amount: 100000
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('should return 422 when amount exceeds sender balance', async () => {
    const res = await request(app)
      .post('/api/v1/participants/transfer')
      .send({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: recipient.qr_code,
        amount: 700000 // exceeds sender balance 600000
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_BALANCE');
  });

  test('should return 404 when recipient does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/participants/transfer')
      .send({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: 'SEPA-NOTEXIST',
        amount: 50000
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RECIPIENT_NOT_FOUND');
  });

  test('should return 403 when sender is blocked', async () => {
    const res = await request(app)
      .post('/api/v1/participants/transfer')
      .send({
        sender_qr_code: blockedParticipant.qr_code,
        recipient_qr_code: recipient.qr_code,
        amount: 50000
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SENDER_BLOCKED');
  });

  test('should return 403 when recipient is blocked', async () => {
    const res = await request(app)
      .post('/api/v1/participants/transfer')
      .send({
        sender_qr_code: sender.qr_code,
        recipient_qr_code: blockedParticipant.qr_code,
        amount: 50000
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RECIPIENT_BLOCKED');
  });
});
