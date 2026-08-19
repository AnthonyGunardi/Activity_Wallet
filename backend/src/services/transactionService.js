const { sequelize, Participant, Activity, Transaction } = require('../models');
const { ParticipantStatus, ActivityStatus, TransactionType } = require('../constants/enums');
const { AppError } = require('../utils/responseEnvelope');
const { withKeyLock } = require('../utils/asyncLock');

/**
 * Looks up a participant by QR code for booth staff verification and returns eligible activities.
 *
 * @param {string} qrCode - Participant QR code token
 * @returns {Promise<{
 *   participant: {
 *     id: string,
 *     name: string,
 *     qr_code: string,
 *     initial_credit: number,
 *     current_balance: number,
 *     total_spent: number,
 *     status: string
 *   },
 *   eligible_activities: Array<{
 *     id: string,
 *     name: string,
 *     price: number,
 *     description: string|null,
 *     is_affordable: boolean
 *   }>
 * }>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND
 * @throws {AppError} 403 PARTICIPANT_BLOCKED
 */
async function scanParticipant(qrCode) {
  const participant = await Participant.findOne({
    where: { qr_code: qrCode }
  });

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan kode QR tersebut tidak ditemukan.', 404);
  }

  if (participant.status === ParticipantStatus.BLOCKED) {
    throw new AppError('PARTICIPANT_BLOCKED', 'Kartu atau akses peserta telah diblokir oleh administrator.', 403);
  }

  const activities = await Activity.findAll({
    where: { status: ActivityStatus.ACTIVE },
    order: [['price', 'ASC']]
  });

  const eligibleActivities = activities.map((act) => ({
    id: act.id,
    name: act.name,
    price: act.price,
    description: act.description,
    is_affordable: participant.current_balance >= act.price
  }));

  return {
    participant: {
      id: participant.id,
      name: participant.name,
      qr_code: participant.qr_code,
      initial_credit: participant.initial_credit,
      current_balance: participant.current_balance,
      total_spent: participant.total_spent,
      status: participant.status
    },
    eligible_activities: eligibleActivities
  };
}

/**
 * Atomically executes credit deduction for a water sport activity with concurrency row-level locking.
 * Prevents race conditions / double spending and appends immutable ledger transaction.
 *
 * @param {{
 *   qr_code: string,
 *   activity_id: string,
 *   staff_id: string,
 *   notes?: string|null
 * }} params
 * @returns {Promise<{
 *   transaction: {
 *     id: string,
 *     type: string,
 *     amount: number,
 *     balance_before: number,
 *     balance_after: number,
 *     activity_name: string,
 *     notes: string|null,
 *     created_at: Date
 *   },
 *   updated_balance: number,
 *   participant: {
 *     id: string,
 *     name: string,
 *     qr_code: string,
 *     current_balance: number
 *   }
 * }>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND or ACTIVITY_NOT_FOUND
 * @throws {AppError} 403 PARTICIPANT_BLOCKED
 * @throws {AppError} 422 ACTIVITY_INACTIVE or INSUFFICIENT_BALANCE
 */
async function processDeduction({ qr_code, activity_id, staff_id, notes }) {
  return await withKeyLock(qr_code, async () => {
    return await sequelize.transaction(async (t) => {
      const isPostgres = sequelize.getDialect() === 'postgres';
      // 1. Fetch participant with pessimistic update lock
      const participant = await Participant.findOne({
        where: { qr_code },
        ...(isPostgres ? { lock: t.LOCK.UPDATE } : {}),
        transaction: t
      });

      if (!participant) {
        throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan kode QR tersebut tidak ditemukan.', 404);
      }

      if (participant.status === ParticipantStatus.BLOCKED) {
        throw new AppError('PARTICIPANT_BLOCKED', 'Kartu atau akses peserta telah diblokir oleh administrator.', 403);
      }

      // 2. Fetch activity
      const activity = await Activity.findByPk(activity_id, {
        transaction: t
      });

      if (!activity) {
        throw new AppError('ACTIVITY_NOT_FOUND', 'Wahana aktivitas yang dipilih tidak ditemukan.', 404);
      }

      if (activity.status !== ActivityStatus.ACTIVE) {
        throw new AppError('ACTIVITY_INACTIVE', 'Wahana aktivitas saat ini sedang tidak beroperasi atau nonaktif.', 422);
      }

      // 3. Balance Invariant Check
      if (participant.current_balance < activity.price) {
        throw new AppError('INSUFFICIENT_BALANCE', 'Saldo peserta tidak mencukupi untuk aktivitas ini.', 422);
      }

      // 4. State snapshot & mutation
      const balance_before = participant.current_balance;
      const balance_after = balance_before - activity.price;

      participant.current_balance = balance_after;
      participant.total_spent = participant.total_spent + activity.price;
      await participant.save({ transaction: t });

      // 5. Append immutable Transaction entry
      const tx = await Transaction.create(
        {
          participant_id: participant.id,
          activity_id: activity.id,
          staff_id,
          type: TransactionType.DEDUCTION,
          amount: activity.price,
          balance_before,
          balance_after,
          notes: notes || null
        },
        { transaction: t }
      );

      return {
        transaction: {
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          balance_before: tx.balance_before,
          balance_after: tx.balance_after,
          activity_name: activity.name,
          notes: tx.notes,
          created_at: tx.created_at
        },
        updated_balance: balance_after,
        participant: {
          id: participant.id,
          name: participant.name,
          qr_code: participant.qr_code,
          current_balance: balance_after
        }
      };
    });
  });
}

/**
 * Retrieves recent transactions processed by a staff member for booth reconciliation.
 *
 * @param {string} staffId
 * @param {number} [limit=20]
 * @returns {Promise<Array<Object>>}
 */
async function getRecentStaffTransactions(staffId, limit = 20) {
  const transactions = await Transaction.findAll({
    where: { staff_id: staffId },
    include: [
      {
        model: Activity,
        as: 'activity',
        attributes: ['id', 'name', 'price']
      },
      {
        model: Participant,
        as: 'participant',
        attributes: ['id', 'name', 'qr_code']
      }
    ],
    order: [['created_at', 'DESC']],
    limit
  });

  return transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    balance_before: tx.balance_before,
    balance_after: tx.balance_after,
    activity_name: tx.activity ? tx.activity.name : null,
    participant_name: tx.participant ? tx.participant.name : null,
    participant_qr: tx.participant ? tx.participant.qr_code : null,
    notes: tx.notes,
    created_at: tx.created_at
  }));
}

module.exports = {
  scanParticipant,
  processDeduction,
  getRecentStaffTransactions
};
