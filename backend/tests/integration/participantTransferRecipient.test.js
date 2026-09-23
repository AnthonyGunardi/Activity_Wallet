const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Participant } = require('../../src/models');
const { ParticipantStatus } = require('../../src/constants/enums');

describe('GET /api/v1/participants/transfer/recipient/:qrCode Integration Tests', () => {
  let activeParticipant;
  let blockedParticipant;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Participant.destroy({ where: {}, truncate: { cascade: true }, force: true });

    activeParticipant = await Participant.create({
      name: 'Budi Santoso',
      qr_code: 'SEPA-BUDI001',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: ParticipantStatus.ACTIVE
    });

    blockedParticipant = await Participant.create({
      name: 'Joko Terblokir',
      qr_code: 'SEPA-JOKO999',
      initial_credit: 1000000,
      current_balance: 500000,
      total_spent: 500000,
      status: ParticipantStatus.BLOCKED
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should return 200 with recipient summary for valid active recipient', async () => {
    const res = await request(app).get(`/api/v1/participants/transfer/recipient/${activeParticipant.qr_code}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recipient).toBeDefined();
    expect(res.body.data.recipient.id).toBe(activeParticipant.id);
    expect(res.body.data.recipient.name).toBe('Budi Santoso');
    expect(res.body.data.recipient.qr_code).toBe('SEPA-BUDI001');
    expect(res.body.data.recipient.status).toBe(ParticipantStatus.ACTIVE);
  });

  test('should return 404 when recipient QR code does not exist', async () => {
    const res = await request(app).get('/api/v1/participants/transfer/recipient/SEPA-NONEXISTENT');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RECIPIENT_NOT_FOUND');
  });

  test('should return 403 when recipient is blocked', async () => {
    const res = await request(app).get(`/api/v1/participants/transfer/recipient/${blockedParticipant.qr_code}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RECIPIENT_BLOCKED');
  });

  test('should return 400 when sender_qr_code query matches recipient qr_code (self-transfer check)', async () => {
    const res = await request(app)
      .get(`/api/v1/participants/transfer/recipient/${activeParticipant.qr_code}`)
      .query({ sender_qr_code: activeParticipant.qr_code });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SELF_TRANSFER_NOT_ALLOWED');
  });

  test('should return 400 when sender_qr_code query param fails schema validation', async () => {
    const res = await request(app)
      .get(`/api/v1/participants/transfer/recipient/${activeParticipant.qr_code}`)
      .query({ sender_qr_code: 'AB' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
