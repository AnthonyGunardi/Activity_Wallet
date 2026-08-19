const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, Participant } = require('../models');
const { ParticipantStatus, DEFAULT_INITIAL_CREDIT } = require('../constants/enums');
const { AppError } = require('../utils/responseEnvelope');

/**
 * Generates a unique QR token string.
 * Format: SEPA-XXXXXX (e.g. SEPA-A1B2C3)
 * @param {string} [prefix='SEPA']
 * @returns {string}
 */
function generateQrToken(prefix = 'SEPA') {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${randomHex}`;
}

/**
 * Lists participants with search, status filtering, and pagination metadata.
 *
 * @param {Object} query
 * @param {number} [query.page=1]
 * @param {number} [query.limit=20]
 * @param {string} [query.search]
 * @param {string} [query.status]
 * @returns {Promise<{
 *   participants: Array<Participant>,
 *   pagination: { total: number, page: number, limit: number, totalPages: number }
 * }>}
 */
async function listParticipants({ page = 1, limit = 20, search, status } = {}) {
  const offset = (page - 1) * limit;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { name: { [Op.like]: term } },
      { qr_code: { [Op.like]: term } }
    ];
  }

  const { rows, count } = await Participant.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  return {
    participants: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit) || 1
    }
  };
}

/**
 * Creates a single participant with starting credit and unique QR code.
 *
 * @param {{ name: string, initial_credit?: number, qr_code?: string }} payload
 * @returns {Promise<Participant>}
 */
async function createParticipant({ name, initial_credit = DEFAULT_INITIAL_CREDIT, qr_code }) {
  let token = qr_code ? qr_code.trim().toUpperCase() : generateQrToken();

  // Ensure unique token if auto-generated
  if (!qr_code) {
    let exists = await Participant.findOne({ where: { qr_code: token } });
    while (exists) {
      token = generateQrToken();
      exists = await Participant.findOne({ where: { qr_code: token } });
    }
  }

  const participant = await Participant.create({
    name: name.trim(),
    qr_code: token,
    initial_credit: Number(initial_credit),
    current_balance: Number(initial_credit),
    total_spent: 0,
    status: ParticipantStatus.ACTIVE
  });

  return participant;
}

/**
 * Bulk creates multiple participants in a single managed database transaction.
 *
 * @param {Array<{ name: string, initial_credit?: number, qr_code?: string }>} participantsList
 * @returns {Promise<{ created_count: number, participants: Array<Participant> }>}
 */
async function bulkCreateParticipants(participantsList = []) {
  return await sequelize.transaction(async (t) => {
    const toInsert = [];

    for (const item of participantsList) {
      let token = item.qr_code ? item.qr_code.trim().toUpperCase() : generateQrToken();
      const credit = typeof item.initial_credit === 'number' ? item.initial_credit : DEFAULT_INITIAL_CREDIT;

      toInsert.push({
        name: item.name.trim(),
        qr_code: token,
        initial_credit: credit,
        current_balance: credit,
        total_spent: 0,
        status: ParticipantStatus.ACTIVE
      });
    }

    const created = await Participant.bulkCreate(toInsert, {
      transaction: t,
      validate: true
    });

    return {
      created_count: created.length,
      participants: created
    };
  });
}

/**
 * Reissues a new unique QR code token for a participant (e.g. in case of lost/damaged wristband).
 * Preserves exact remaining balance, initial credit, total spent, and full transaction history.
 *
 * @param {string} participantId
 * @returns {Promise<{
 *   participant: Participant,
 *   previous_qr_code: string,
 *   new_qr_code: string
 * }>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND
 */
async function reissueQrCode(participantId) {
  const participant = await Participant.findByPk(participantId);

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan ID tersebut tidak ditemukan.', 404);
  }

  const previous_qr_code = participant.qr_code;
  let new_qr_code = generateQrToken('SEPA-REISSUE');

  let exists = await Participant.findOne({ where: { qr_code: new_qr_code } });
  while (exists) {
    new_qr_code = generateQrToken('SEPA-REISSUE');
    exists = await Participant.findOne({ where: { qr_code: new_qr_code } });
  }

  participant.qr_code = new_qr_code;
  await participant.save();

  return {
    participant,
    previous_qr_code,
    new_qr_code
  };
}

/**
 * Updates participant account status (ACTIVE or BLOCKED).
 *
 * @param {string} participantId
 * @param {'ACTIVE' | 'BLOCKED'} status
 * @returns {Promise<Participant>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND
 */
async function updateParticipantStatus(participantId, status) {
  const participant = await Participant.findByPk(participantId);

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan ID tersebut tidak ditemukan.', 404);
  }

  participant.status = status;
  await participant.save();

  return participant;
}

module.exports = {
  generateQrToken,
  listParticipants,
  createParticipant,
  bulkCreateParticipants,
  reissueQrCode,
  updateParticipantStatus
};
