const { sequelize, Participant, Transaction } = require('../models');
const { ParticipantStatus, TransactionType } = require('../constants/enums');
const { AppError } = require('../utils/responseEnvelope');
const { withKeyLock } = require('../utils/asyncLock');
const { logger } = require('../config/logger');

/**
 * Atomically executes peer-to-peer balance transfer between two participants.
 * Acquires deterministic locks, enforces active status & non-negative balance invariants,
 * mutates balances, and records linked immutable ledger entries (TRANSFER_OUT & TRANSFER_IN).
 *
 * @param {{
 *   sender_qr_code: string,
 *   recipient_qr_code: string,
 *   amount: number,
 *   notes?: string|null
 * }} params
 * @returns {Promise<{
 *   transfer: {
 *     sender_balance: number,
 *     amount: number,
 *     recipient_name: string,
 *     transfer_out_id: string,
 *     transfer_in_id: string
 *   }
 * }>}
 * @throws {AppError} 400 SELF_TRANSFER_NOT_ALLOWED
 * @throws {AppError} 404 SENDER_NOT_FOUND or RECIPIENT_NOT_FOUND
 * @throws {AppError} 403 SENDER_BLOCKED or RECIPIENT_BLOCKED
 * @throws {AppError} 422 INSUFFICIENT_BALANCE
 */
async function executeTransfer({ sender_qr_code, recipient_qr_code, amount, notes }) {
  if (sender_qr_code === recipient_qr_code) {
    throw new AppError('SELF_TRANSFER_NOT_ALLOWED', 'Tidak dapat mentransfer saldo ke akun sendiri.', 400);
  }

  // Deterministic lock acquisition order by sorted QR code keys to avoid application deadlocks
  const [firstKey, secondKey] = [sender_qr_code, recipient_qr_code].sort();

  return await withKeyLock(firstKey, async () => {
    return await withKeyLock(secondKey, async () => {
      return await sequelize.transaction(async (t) => {
        const isLockSupported = sequelize.getDialect() === 'postgres' || sequelize.getDialect() === 'mysql';

        // Deterministic row-level lock ordering sorted by ID in database
        const participants = await Participant.findAll({
          where: {
            qr_code: [sender_qr_code, recipient_qr_code]
          },
          order: [['id', 'ASC']],
          ...(isLockSupported ? { lock: t.LOCK.UPDATE } : {}),
          transaction: t
        });

        const sender = participants.find((p) => p.qr_code === sender_qr_code);
        const recipient = participants.find((p) => p.qr_code === recipient_qr_code);

        if (!sender) {
          throw new AppError('SENDER_NOT_FOUND', 'Peserta pengirim tidak ditemukan.', 404);
        }

        if (!recipient) {
          throw new AppError('RECIPIENT_NOT_FOUND', 'Peserta penerima tidak ditemukan.', 404);
        }

        if (sender.status === ParticipantStatus.BLOCKED) {
          throw new AppError('SENDER_BLOCKED', 'Kartu atau akses pengirim sedang diblokir.', 403);
        }

        if (recipient.status === ParticipantStatus.BLOCKED) {
          throw new AppError('RECIPIENT_BLOCKED', 'Kartu atau akses penerima sedang diblokir.', 403);
        }

        if (sender.current_balance < amount) {
          throw new AppError('INSUFFICIENT_BALANCE', 'Saldo pengirim tidak mencukupi untuk melakukan transfer ini.', 422);
        }

        const senderBalanceBefore = sender.current_balance;
        const senderBalanceAfter = senderBalanceBefore - amount;
        sender.current_balance = senderBalanceAfter;
        await sender.save({ transaction: t });

        const recipientBalanceBefore = recipient.current_balance;
        const recipientBalanceAfter = recipientBalanceBefore + amount;
        recipient.current_balance = recipientBalanceAfter;
        await recipient.save({ transaction: t });

        const outNotes = notes && notes.trim().length > 0
          ? `${notes.trim()} (Transfer ke ${recipient.name})`
          : `Transfer saldo ke ${recipient.name} (${recipient.qr_code})`;

        const inNotes = notes && notes.trim().length > 0
          ? `${notes.trim()} (Transfer dari ${sender.name})`
          : `Transfer saldo dari ${sender.name} (${sender.qr_code})`;

        const transferOutTx = await Transaction.create(
          {
            participant_id: sender.id,
            activity_id: null,
            staff_id: null,
            type: TransactionType.TRANSFER_OUT,
            amount,
            balance_before: senderBalanceBefore,
            balance_after: senderBalanceAfter,
            reference_id: null,
            notes: outNotes
          },
          { transaction: t }
        );

        const transferInTx = await Transaction.create(
          {
            participant_id: recipient.id,
            activity_id: null,
            staff_id: null,
            type: TransactionType.TRANSFER_IN,
            amount,
            balance_before: recipientBalanceBefore,
            balance_after: recipientBalanceAfter,
            reference_id: transferOutTx.id,
            notes: inNotes
          },
          { transaction: t }
        );

        logger.info('Transfer executed successfully', {
          sender_id: sender.id,
          recipient_id: recipient.id,
          amount,
          transfer_out_id: transferOutTx.id,
          transfer_in_id: transferInTx.id
        });

        return {
          transfer: {
            sender_balance: senderBalanceAfter,
            amount,
            recipient_name: recipient.name,
            transfer_out_id: transferOutTx.id,
            transfer_in_id: transferInTx.id
          }
        };
      });
    });
  });
}

module.exports = {
  executeTransfer
};
