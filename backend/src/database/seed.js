const { sequelize, User, Participant, Activity } = require('../models');
const { UserRole, ParticipantStatus, ActivityStatus } = require('../constants/enums');
const { logger } = require('../config/logger');

/**
 * Seeds the database with default admin, booth staff, water sport activities, and initial participants.
 * @param {boolean} [force=false] - If true, syncs with { force: true }
 * @returns {Promise<{ users: User[], activities: Activity[], participants: Participant[] }>}
 */
async function seedDatabase(force = false) {
  logger.info(`Starting database seed (force: ${force})...`);
  await sequelize.sync({ force });

  // 1. Seed Users (Admin & Booth Staff)
  const usersData = [
    {
      username: 'admin',
      password_hash: 'admin123',
      name: 'Event Supervisor (Sepa)',
      role: UserRole.ADMIN,
      status: 'ACTIVE'
    },
    {
      username: 'staff_jetski',
      password_hash: 'staff123',
      name: 'Booth Staff Jet Ski',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    },
    {
      username: 'staff_banana',
      password_hash: 'staff123',
      name: 'Booth Staff Banana Boat',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    },
    {
      username: 'staff_donut',
      password_hash: 'staff123',
      name: 'Booth Staff Donut Boat',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    },
    {
      username: 'staff_snorkeling',
      password_hash: 'staff123',
      name: 'Booth Staff Snorkeling',
      role: UserRole.STAFF,
      status: 'ACTIVE'
    }
  ];

  const users = [];
  for (const userData of usersData) {
    const [user] = await User.findOrCreate({
      where: { username: userData.username },
      defaults: userData
    });
    users.push(user);
  }

  // 2. Seed Activities
  const activitiesData = [
    {
      name: 'Jet Ski (15 Menit)',
      price: 350000,
      description: 'Pengalaman berkendara jet ski berkecepatan tinggi didampingi instruktur profesional.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Banana Boat (15 Menit)',
      price: 150000,
      description: 'Wahana perahu pisang seru ditarik speedboat keliling perairan Pulau Sepa.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Donut Boat (15 Menit)',
      price: 175000,
      description: 'Sensasi berputar dan meluncur di atas ombak dengan perahu donat.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Snorkeling Set + Spot Terumbu Karang',
      price: 200000,
      description: 'Paket lengkap masker snorkel, fin, pelampung, dan pemandu spot terumbu karang.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Canoe Single (30 Menit)',
      price: 100000,
      description: 'Kano tunggal untuk menikmati ketenangan pantai dan laguna pulau.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Canoe Double (30 Menit)',
      price: 150000,
      description: 'Kano ganda untuk 2 orang menyusuri garis pantai Pulau Sepa.',
      status: ActivityStatus.ACTIVE
    }
  ];

  const activities = [];
  for (const actData of activitiesData) {
    const [activity] = await Activity.findOrCreate({
      where: { name: actData.name },
      defaults: actData
    });
    activities.push(activity);
  }

  // 3. Seed Participants
  const participantsData = [
    { name: 'Budi Santoso', qr_code: 'SEPA-001' },
    { name: 'Siti Rahmawati', qr_code: 'SEPA-002' },
    { name: 'Ahmad Fauzi', qr_code: 'SEPA-003' },
    { name: 'Dewi Lestari', qr_code: 'SEPA-004' },
    { name: 'Eko Prasetyo', qr_code: 'SEPA-005' },
    { name: 'Rina Anggraini', qr_code: 'SEPA-006' },
    { name: 'Hendra Gunawan', qr_code: 'SEPA-007' },
    { name: 'Maya Putri', qr_code: 'SEPA-008' },
    { name: 'Rizky Firmansyah', qr_code: 'SEPA-009' },
    { name: 'Nadia Safitri', qr_code: 'SEPA-010' }
  ];

  const participants = [];
  for (const partData of participantsData) {
    const [participant] = await Participant.findOrCreate({
      where: { qr_code: partData.qr_code },
      defaults: {
        ...partData,
        initial_credit: 1000000,
        current_balance: 1000000,
        total_spent: 0,
        status: ParticipantStatus.ACTIVE
      }
    });
    participants.push(participant);
  }

  logger.info(
    `Seeding complete: ${users.length} users, ${activities.length} activities, ${participants.length} participants.`
  );
  return { users, activities, participants };
}

if (require.main === module) {
  seedDatabase(true)
    .then(() => {
      logger.info('Database seeded successfully.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Database seeding failed:', err);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase
};
