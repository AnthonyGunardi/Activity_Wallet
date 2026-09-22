const { sequelize, User, Participant, Activity } = require('../../src/models');
const { seedDatabase } = require('../../src/database/seed');
const { UserRole } = require('../../src/constants/enums');

describe('Database Seeder Unit Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('seedDatabase should populate admin, staff, activities, and participants', async () => {
    const result = await seedDatabase(true);

    expect(result.users.length).toBeGreaterThanOrEqual(5);
    expect(result.activities.length).toBeGreaterThanOrEqual(6);
    expect(result.participants.length).toBe(10);

    const admin = await User.findOne({ where: { username: 'admin' } });
    expect(admin).toBeDefined();
    expect(admin.role).toBe(UserRole.ADMIN);

    const isMatch = await admin.comparePassword('admin123');
    expect(isMatch).toBe(true);

    const jetSki = await Activity.findOne({ where: { name: 'Jetski' } });
    expect(jetSki).toBeDefined();
    expect(jetSki.price).toBe(650000);

    const firstParticipant = await Participant.findOne({ where: { qr_code: 'SEPA-001' } });
    expect(firstParticipant).toBeDefined();
    expect(firstParticipant.initial_credit).toBe(1000000);
    expect(firstParticipant.current_balance).toBe(1000000);
  });
});
