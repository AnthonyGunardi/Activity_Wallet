const { Op } = require('sequelize');
const { sequelize, User, Participant, Activity, Transaction } = require('../models');
const { TransactionType } = require('../constants/enums');
const { AppError } = require('../utils/responseEnvelope');
const { withKeyLock } = require('../utils/asyncLock');

/**
 * Lists transactions from the immutable audit ledger with multi-criteria filtering,
 * search by participant details, and pagination metadata.
 *
 * @param {Object} query
 * @param {number} [query.page=1]
 * @param {number} [query.limit=20]
 * @param {string} [query.participant_id]
 * @param {string} [query.activity_id]
 * @param {string} [query.staff_id]
 * @param {string} [query.type]
 * @param {string} [query.start_date]
 * @param {string} [query.end_date]
 * @param {string} [query.search]
 * @returns {Promise<{
 *   transactions: Array<Transaction>,
 *   pagination: { total: number, page: number, limit: number, totalPages: number }
 * }>}
 */
async function listTransactions({
  page = 1,
  limit = 20,
  participant_id,
  activity_id,
  staff_id,
  type,
  start_date,
  end_date,
  search
} = {}) {
  const offset = (page - 1) * limit;
  const where = {};

  if (participant_id) where.participant_id = participant_id;
  if (activity_id) where.activity_id = activity_id;
  if (staff_id) where.staff_id = staff_id;
  if (type) where.type = type;

  if (start_date || end_date) {
    where.created_at = {};
    if (start_date) where.created_at[Op.gte] = new Date(start_date);
    if (end_date) where.created_at[Op.lte] = new Date(end_date);
  }

  const participantWhere = {};
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    participantWhere[Op.or] = [
      { name: { [Op.like]: term } },
      { qr_code: { [Op.like]: term } }
    ];
  }

  const { rows, count } = await Transaction.findAndCountAll({
    where,
    include: [
      {
        model: Participant,
        as: 'participant',
        attributes: ['id', 'name', 'qr_code'],
        where: Object.keys(participantWhere).length > 0 ? participantWhere : undefined
      },
      {
        model: Activity,
        as: 'activity',
        attributes: ['id', 'name', 'price']
      },
      {
        model: User,
        as: 'staff',
        attributes: ['id', 'name', 'username', 'role']
      },
      {
        model: Transaction,
        as: 'refund_transactions',
        attributes: ['id', 'type', 'amount', 'created_at']
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
    distinct: true
  });

  return {
    transactions: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit) || 1
    }
  };
}

/**
 * Atomically processes an authorized refund for an earlier deduction transaction.
 * Restores participant wallet balance, enforces duplicate refund guards, and appends
 * an immutable REFUND ledger entry linked to the original transaction ID.
 *
 * @param {Object} params
 * @param {string} params.transaction_id - Original transaction UUID to refund
 * @param {string} params.staff_id - Admin/Supervisor UUID issuing the refund
 * @param {string} [params.notes] - Optional reason/audit notes
 * @returns {Promise<{
 *   refund_transaction: Transaction,
 *   restored_balance: number,
 *   participant: Participant
 * }>}
 * @throws {AppError} 404 TRANSACTION_NOT_FOUND
 * @throws {AppError} 422 INVALID_TRANSACTION_TYPE or ALREADY_REFUNDED
 */
async function processRefund({ transaction_id, staff_id, notes }) {
  const originalTx = await Transaction.findByPk(transaction_id);

  if (!originalTx) {
    throw new AppError('TRANSACTION_NOT_FOUND', 'Transaksi yang akan direfund tidak ditemukan.', 404);
  }

  if (originalTx.type !== TransactionType.DEDUCTION) {
    throw new AppError(
      'INVALID_TRANSACTION_TYPE',
      'Hanya transaksi pengurangan (DEDUCTION) yang dapat diproses untuk refund.',
      422
    );
  }

  const participant = await Participant.findByPk(originalTx.participant_id);
  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta terkait transaksi ini tidak ditemukan.', 404);
  }

  return await withKeyLock(participant.qr_code, async () => {
    return await sequelize.transaction(async (t) => {
      const isLockSupported = sequelize.getDialect() === 'postgres' || sequelize.getDialect() === 'mysql';

      // 1. Enforce duplicate refund invariant
      const existingRefund = await Transaction.findOne({
        where: {
          reference_id: originalTx.id,
          type: TransactionType.REFUND
        },
        transaction: t
      });

      if (existingRefund) {
        throw new AppError('ALREADY_REFUNDED', 'Transaksi ini sudah pernah direfund sebelumnya.', 422);
      }

      // 2. Fetch participant with pessimistic update lock
      const lockedParticipant = await Participant.findByPk(participant.id, {
        ...(isLockSupported ? { lock: t.LOCK.UPDATE } : {}),
        transaction: t
      });

      // 3. Balance restoration snapshot
      const balance_before = lockedParticipant.current_balance;
      const balance_after = balance_before + originalTx.amount;

      lockedParticipant.current_balance = balance_after;
      lockedParticipant.total_spent = Math.max(0, lockedParticipant.total_spent - originalTx.amount);
      await lockedParticipant.save({ transaction: t });

      // 4. Create immutable REFUND transaction record
      const refundTx = await Transaction.create(
        {
          participant_id: lockedParticipant.id,
          activity_id: originalTx.activity_id,
          staff_id,
          type: TransactionType.REFUND,
          amount: originalTx.amount,
          balance_before,
          balance_after,
          reference_id: originalTx.id,
          notes: notes || 'Refund disetujui administrator'
        },
        { transaction: t }
      );

      return {
        refund_transaction: refundTx,
        restored_balance: balance_after,
        participant: lockedParticipant
      };
    });
  });
}

module.exports = {
  listTransactions,
  processRefund
};
