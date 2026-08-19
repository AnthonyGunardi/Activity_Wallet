const { sequelize, Participant, Activity, Transaction, User } = require('../../src/models');
const transactionService = require('../../src/services/transactionService');
const { ParticipantStatus, ActivityStatus, UserRole } = require('../../src/constants/enums');

describe('Double Spend & Concurrency Race Condition Tests', () => {
  let staffUser, raceParticipant, jetSkiActivity;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    staffUser = await User.create({
      username: 'race_staff',
      password_hash: 'staffpass',
      name: 'Race Staff',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    });

    // Participant has exactly Rp350.000 (enough for ONE Jet Ski only)
    raceParticipant = await Participant.create({
      name: 'Race Participant',
      qr_code: 'SEPA-RACE-001',
      initial_credit: 1000000,
      current_balance: 350000,
      total_spent: 650000,
      status: ParticipantStatus.ACTIVE
    });

    jetSkiActivity = await Activity.create({
      name: 'Jet Ski Race',
      price: 350000,
      description: '15 min jet ski',
      status: ActivityStatus.ACTIVE
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('should prevent double spending when 5 concurrent deductions target the same wallet simultaneously', async () => {
    // Launch 5 simultaneous deductions concurrently
    const attempts = [1, 2, 3, 4, 5].map((i) =>
      transactionService.processDeduction({
        qr_code: 'SEPA-RACE-001',
        activity_id: jetSkiActivity.id,
        staff_id: staffUser.id,
        notes: `Concurrent Attempt #${i}`
      })
    );

    const results = await Promise.allSettled(attempts);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly 1 request should succeed, and 4 should be rejected with INSUFFICIENT_BALANCE
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(4);

    rejected.forEach((r) => {
      expect(r.reason.code).toBe('INSUFFICIENT_BALANCE');
    });

    // Final balance MUST be exactly 0, NEVER negative
    const p = await Participant.findByPk(raceParticipant.id);
    expect(p.current_balance).toBe(0);
    expect(p.total_spent).toBe(1000000);

    // Exactly 1 new Transaction record should exist for this participant
    const count = await Transaction.count({
      where: { participant_id: raceParticipant.id }
    });
    expect(count).toBe(1);
  });
});
