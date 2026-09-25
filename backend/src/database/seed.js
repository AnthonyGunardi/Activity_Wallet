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
      name: 'Event Admin',
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
      name: 'Jetski',
      price: 650000,
      description: 'Sensasi bermain jet ski berkecepatan tinggi melintasi ombak dengan pemandangan pantai yang memukau (durasi 15 menit).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Jetski 99',
      price: 750000,
      description: 'Sensasi bermain jet ski 99 berkecepatan tinggi melintasi ombak dengan pemandangan pantai yang memukau (durasi 15 menit).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Waterbike Single',
      price: 200000,
      description: 'Sepeda air bertenaga kayuh untuk 1 orang meluncur santai di atas permukaan laut yang tenang.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Waterbike Double',
      price: 300000,
      description: 'Sepeda air bertenaga kayuh untuk 2 orang dengan pelampung ganda meluncur mulus di atas perairan yang tenang.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Banana Boat',
      price: 125000,
      description: 'Keseruan meluncur dan membelah ombak bersama teman-teman dengan banana boat (minimal 3 orang, harga per orang).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Donut Boat',
      price: 125000,
      description: 'Sensasi seru berputar dan terombang-ambing di atas donut boat bersama teman-teman (minimal 3 orang, harga per orang).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Transparent Canoe',
      price: 100000,
      description: 'Mendayung kano transparan di atas air jernih dengan pemandangan langsung ke bawah permukaan laut.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Canoe',
      price: 25000,
      description: 'Mendayung kano di perairan tenang sambil menikmati ketenangan dan keindahan pemandangan alam sekitar.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Stand Up Paddleboard',
      price: 100000,
      description: 'Berselancar santai dan melatih keseimbangan di atas laut yang tenang menggunakan stand up paddleboard.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Snorkeling Gear',
      price: 150000,
      description: 'Sewa set perlengkapan snorkeling lengkap termasuk pelampung, masker, dan sepatu pantai (tersedia hingga pukul 17.00).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Snorkeling + Goggles',
      price: 115000,
      description: 'Sewa masker snorkel dan kacamata selam untuk eksplorasi bawah air (tersedia hingga pukul 17.00).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Life Jacket',
      price: 50000,
      description: 'Sewa jaket pelampung keselamatan untuk berbagai aktivitas perairan (tersedia hingga pukul 17.00).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Fish Feeding',
      price: 30000,
      description: 'Sensasi memberi makan kawanan ikan hias warna-warni secara langsung di perairan jernih (per bungkus).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Fishing Gear Rent (1 Day)',
      price: 200000,
      description: 'Sewa perlengkapan alat pancing lengkap siap pakai untuk durasi 1 hari.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Fishing Gear Rent (2 Day)',
      price: 350000,
      description: 'Sewa perlengkapan alat pancing lengkap siap pakai untuk durasi 2 hari.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Umpan Pancing',
      price: 50000,
      description: 'Umpan pancing siap pakai untuk aktivitas memancing (per wadah/cup).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Booties',
      price: 50000,
      description: 'Sepatu air pelindung kaki dari karang, kerang, dan kerikil tajam (semua ukuran, hingga pukul 17.00).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Locker',
      price: 60000,
      description: 'Sewa loker aman untuk menyimpan barang bawaan, pakaian, dan barang berharga (hingga pukul 17.00, per orang).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Underwater Photo & Video',
      price: 500000,
      description: 'Layanan dokumentasi foto dan video bawah air profesional selama 30 menit.',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Drone Shot',
      price: 500000,
      description: 'Layanan dokumentasi foto dan video udara sinematik menggunakan drone (durasi 20 menit / 1 baterai).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Traditional Boat',
      price: 500000,
      description: 'Sewa perahu tradisional berkapasitas maksimal 8 orang untuk menikmati suasana laut yang tenang (per jam).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Island Trip',
      price: 1000000,
      description: 'Paket trip perahu (Sunset Trip / Hopping Island / Mancing luar pulau) maks. 10 orang termasuk pelampung & pemandu (per jam).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Snorkeling Trip',
      price: 750000,
      description: 'Tur perahu ke spot snorkeling terbaik berkapasitas maks. 10 orang termasuk pelampung & pemandu wisata (per jam).',
      status: ActivityStatus.ACTIVE
    },
    {
      name: 'Board Games (Deposit)',
      price: 100000,
      description: 'Deposit peminjaman aneka permainan papan (board games) seru untuk semua kalangan (fasilitas gratis, deposit IDR 100.000).',
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
