const { Participant, Activity, Transaction } = require('../models');
const { ParticipantStatus, ActivityStatus } = require('../constants/enums');
const { AppError } = require('../utils/responseEnvelope');

/**
 * Retrieves public wallet details for a participant identified by their QR code token.
 * Includes remaining balance, credit allocation, active activity catalog with affordability flags,
 * and personal transaction history.
 *
 * @param {string} qrCode - Unique QR token string associated with the participant's wristband/pass.
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
 *   activities: Array<{
 *     id: string,
 *     name: string,
 *     price: number,
 *     description: string|null,
 *     is_affordable: boolean
 *   }>,
 *   recent_transactions: Array<{
 *     id: string,
 *     type: string,
 *     amount: number,
 *     balance_before: number,
 *     balance_after: number,
 *     activity_name: string|null,
 *     notes: string|null,
 *     created_at: Date
 *   }>
 * }>}
 * @throws {AppError} 404 PARTICIPANT_NOT_FOUND when QR code is not registered.
 * @throws {AppError} 403 PARTICIPANT_BLOCKED when participant status is BLOCKED.
 */
async function getWalletByQrCode(qrCode) {
  const participant = await Participant.findOne({
    where: { qr_code: qrCode }
  });

  if (!participant) {
    throw new AppError('PARTICIPANT_NOT_FOUND', 'Peserta dengan kode QR tersebut tidak ditemukan.', 404);
  }

  if (participant.status === ParticipantStatus.BLOCKED) {
    throw new AppError('PARTICIPANT_BLOCKED', 'Kartu atau akses peserta telah diblokir oleh administrator.', 403);
  }

  const [activities, transactions] = await Promise.all([
    Activity.findAll({
      where: { status: ActivityStatus.ACTIVE },
      order: [['id', 'ASC']]
    }),
    Transaction.findAll({
      where: { participant_id: participant.id },
      include: [
        {
          model: Activity,
          as: 'activity',
          attributes: ['id', 'name', 'price']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    })
  ]);

  const mappedActivities = activities.map((act) => ({
    id: act.id,
    name: act.name,
    price: act.price,
    description: act.description,
    is_affordable: participant.current_balance >= act.price
  }));

  const mappedTransactions = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    balance_before: tx.balance_before,
    balance_after: tx.balance_after,
    activity_name: tx.activity ? tx.activity.name : null,
    notes: tx.notes,
    created_at: tx.created_at
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
    activities: mappedActivities,
    recent_transactions: mappedTransactions
  };
}

/**
 * Looks up and validates a transfer recipient by QR code token string.
 *
 * @param {string} qrCode - Recipient's unique QR code token.
 * @param {string} [senderQrCode] - Optional sender QR code to prevent self-transfer lookup.
 * @returns {Promise<{
 *   id: string,
 *   name: string,
 *   qr_code: string,
 *   status: string
 * }>}
 * @throws {AppError} 404 RECIPIENT_NOT_FOUND if recipient does not exist.
 * @throws {AppError} 403 RECIPIENT_BLOCKED if recipient is blocked.
 * @throws {AppError} 400 SELF_TRANSFER_NOT_ALLOWED if senderQrCode equals qrCode.
 */
async function getTransferRecipient(qrCode, senderQrCode) {
  if (senderQrCode && qrCode.trim() === senderQrCode.trim()) {
    throw new AppError('SELF_TRANSFER_NOT_ALLOWED', 'Tidak dapat mentransfer saldo ke akun sendiri.', 400);
  }

  const recipient = await Participant.findOne({
    where: { qr_code: qrCode.trim() }
  });

  if (!recipient) {
    throw new AppError('RECIPIENT_NOT_FOUND', 'Peserta penerima dengan kode tersebut tidak ditemukan.', 404);
  }

  if (recipient.status === ParticipantStatus.BLOCKED) {
    throw new AppError('RECIPIENT_BLOCKED', 'Akun peserta penerima sedang diblokir oleh administrator.', 403);
  }

  return {
    id: recipient.id,
    name: recipient.name,
    qr_code: recipient.qr_code,
    status: recipient.status
  };
}

module.exports = {
  getWalletByQrCode,
  getTransferRecipient
};

