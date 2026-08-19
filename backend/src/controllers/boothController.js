const transactionService = require('../services/transactionService');
const { formatSuccess } = require('../utils/responseEnvelope');

/**
 * Handles participant QR scan lookup by booth staff.
 * POST /api/v1/booth/scan
 */
async function scan(req, res, next) {
  try {
    const { qr_code } = req.body;
    const result = await transactionService.scanParticipant(qr_code);
    return res.status(200).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles atomic debit transaction execution by booth staff.
 * POST /api/v1/booth/transactions
 */
async function createDeduction(req, res, next) {
  try {
    const { qr_code, activity_id, notes } = req.body;
    const result = await transactionService.processDeduction({
      qr_code,
      activity_id,
      staff_id: req.user.id,
      notes
    });
    return res.status(200).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles fetching recent transactions for authenticated booth staff.
 * GET /api/v1/booth/transactions/recent
 */
async function getRecentTransactions(req, res, next) {
  try {
    const transactions = await transactionService.getRecentStaffTransactions(req.user.id);
    return res.status(200).json(formatSuccess({ transactions }));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  scan,
  createDeduction,
  getRecentTransactions
};
