const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, Participant, Transaction, Activity } = require('../models');
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
 * Lists participants by participant code with search, status filtering, and pagination.
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
    order: [['qr_code', 'ASC']],
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
  const dbInstance = Participant.sequelize || sequelize;
  return await dbInstance.transaction(async (t) => {
    const toInsert = [];
    const usedTokens = new Set();
    const itemsNeedingTokens = [];

    for (const item of participantsList) {
      const manualToken = item.qr_code ? item.qr_code.trim().toUpperCase() : null;
      if (manualToken) {
        usedTokens.add(manualToken);
      } else {
        itemsNeedingTokens.push(item);
      }
    }

    if (itemsNeedingTokens.length > 0) {
      const generatedTokens = [];
      while (generatedTokens.length < itemsNeedingTokens.length) {
        const candidate = generateQrToken();
        if (!usedTokens.has(candidate)) {
          usedTokens.add(candidate);
          generatedTokens.push(candidate);
        }
      }

      let tokensToCheck = [...generatedTokens];
      let existing = await Participant.findAll({
        where: { qr_code: tokensToCheck },
        attributes: ['qr_code'],
        transaction: t,
        raw: true
      });

      while (existing.length > 0) {
        const existingSet = new Set(existing.map((e) => e.qr_code));
        const replacementTokens = [];
        for (let i = 0; i < tokensToCheck.length; i++) {
          if (existingSet.has(tokensToCheck[i])) {
            let nextToken = generateQrToken();
            while (usedTokens.has(nextToken)) {
              nextToken = generateQrToken();
            }
            usedTokens.add(nextToken);
            tokensToCheck[i] = nextToken;
            replacementTokens.push(nextToken);
          }
        }
        existing = await Participant.findAll({
          where: { qr_code: replacementTokens },
          attributes: ['qr_code'],
          transaction: t,
          raw: true
        });
      }

      for (let i = 0; i < itemsNeedingTokens.length; i++) {
        itemsNeedingTokens[i]._assignedToken = tokensToCheck[i];
      }
    }

    for (const item of participantsList) {
      const token = item._assignedToken || (item.qr_code ? item.qr_code.trim().toUpperCase() : null);
      if (item._assignedToken) {
        delete item._assignedToken;
      }
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
 * Retrieves a single participant by ID including their transaction history.
 *
 * @param {string} participantId
 * @returns {Promise<Participant>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND
 */
async function getParticipantById(participantId) {
  const participant = await Participant.findByPk(participantId, {
    include: [
      {
        model: Transaction,
        as: 'transactions',
        include: [
          { model: Activity, as: 'activity', attributes: ['id', 'name', 'price'] }
        ]
      }
    ],
    order: [[{ model: Transaction, as: 'transactions' }, 'created_at', 'DESC']]
  });

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan ID tersebut tidak ditemukan.', 404);
  }

  return participant;
}

/**
 * Updates participant information (e.g. name or status).
 *
 * @param {string} participantId
 * @param {{ name?: string, status?: 'ACTIVE' | 'BLOCKED' }} payload
 * @returns {Promise<Participant>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND
 */
async function updateParticipant(participantId, { name, status } = {}) {
  const participant = await Participant.findByPk(participantId);

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan ID tersebut tidak ditemukan.', 404);
  }

  if (name !== undefined) {
    participant.name = name.trim();
  }

  if (status !== undefined) {
    participant.status = status;
  }

  await participant.save();
  return participant;
}

/**
 * Deletes a participant if they have no existing transaction history in the audit ledger.
 * If transactions exist, rejects with 422 to preserve immutable audit trail.
 *
 * @param {string} participantId
 * @returns {Promise<{ deleted: boolean, id: string }>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND, 422 CANNOT_DELETE_PARTICIPANT_WITH_TRANSACTIONS
 */
async function deleteParticipant(participantId) {
  const participant = await Participant.findByPk(participantId);

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan ID tersebut tidak ditemukan.', 404);
  }

  const txCount = await Transaction.count({
    where: { participant_id: participantId }
  });

  if (txCount > 0) {
    throw new AppError(
      'CANNOT_DELETE_PARTICIPANT_WITH_TRANSACTIONS',
      'Peserta yang sudah memiliki riwayat transaksi tidak dapat dihapus. Silakan gunakan fitur Blokir (Status: BLOCKED) untuk menonaktifkan.',
      422
    );
  }

  await participant.destroy();

  return {
    deleted: true,
    id: participantId
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
  getParticipantById,
  createParticipant,
  bulkCreateParticipants,
  updateParticipant,
  deleteParticipant,
  reissueQrCode,
  updateParticipantStatus
};
