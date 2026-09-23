const { sequelize, Participant, Transaction } = require('../../src/models');
const transferService = require('../../src/services/transferService');
const { ParticipantStatus } = require('../../src/constants/enums');

describe('Transfer Concurrency, Race Condition & Deadlock Freedom Tests', () => {
  let userA, userB, userC;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Transaction.destroy({ where: {}, force: true });
    await Participant.destroy({ where: {}, force: true });

    userA = await Participant.create({
      name: 'User A',
      qr_code: 'SEPA-CONCUR-A',
      initial_credit: 1000000,
      current_balance: 200000, // Enough for only ONE 150k transfer
      total_spent: 800000,
      status: ParticipantStatus.ACTIVE
    });

    userB = await Participant.create({
      name: 'User B',
      qr_code: 'SEPA-CONCUR-B',
      initial_credit: 1000000,
      current_balance: 300000,
      total_spent: 700000,
      status: ParticipantStatus.ACTIVE
    });

    userC = await Participant.create({
      name: 'User C',
      qr_code: 'SEPA-CONCUR-C',
      initial_credit: 1000000,
      current_balance: 500000,
      total_spent: 500000,
      status: ParticipantStatus.ACTIVE
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should prevent transfer race condition when multiple requests exceed balance', async () => {
    // userA has 200k. 3 concurrent transfers of 150k each target userB.
    const promises = [1, 2, 3].map((i) =>
      transferService.executeTransfer({
        sender_qr_code: userA.qr_code,
        recipient_qr_code: userB.qr_code,
        amount: 150000,
        notes: `Concurrent transfer ${i}`
      })
    );

    const results = await Promise.allSettled(promises);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(2);

    const updatedUserA = await Participant.findByPk(userA.id);
    const updatedUserB = await Participant.findByPk(userB.id);

    expect(updatedUserA.current_balance).toBe(50000);
    expect(updatedUserB.current_balance).toBe(450000);
  });

  test('should execute reciprocal concurrent transfers between User B and User C without deadlock', async () => {
    // User B sends 50k to User C, while User C sends 70k to User B simultaneously
    const req1 = transferService.executeTransfer({
      sender_qr_code: userB.qr_code,
      recipient_qr_code: userC.qr_code,
      amount: 50000,
      notes: 'B to C'
    });

    const req2 = transferService.executeTransfer({
      sender_qr_code: userC.qr_code,
      recipient_qr_code: userB.qr_code,
      amount: 70000,
      notes: 'C to B'
    });

    const results = await Promise.all([req1, req2]);
    expect(results).toHaveLength(2);

    const updatedB = await Participant.findByPk(userB.id);
    const updatedC = await Participant.findByPk(userC.id);

    // Initial: B=300k, C=500k.
    // B - 50k + 70k = 320k
    // C - 70k + 50k = 480k
    expect(updatedB.current_balance).toBe(320000);
    expect(updatedC.current_balance).toBe(480000);
  });
});
