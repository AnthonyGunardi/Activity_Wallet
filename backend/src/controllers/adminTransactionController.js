const adminReportService = require('../services/adminReportService');
const refundService = require('../services/refundService');
const { formatSuccess } = require('../utils/responseEnvelope');

/**
 * Returns executive dashboard summary metrics.
 * GET /api/v1/admin/dashboard/summary
 */
async function getSummary(req, res, next) {
  try {
    const summary = await adminReportService.getDashboardSummary();
    return res.status(200).json(formatSuccess(summary));
  } catch (error) {
    return next(error);
  }
}

/**
 * Lists transactions in the audit ledger with filters and pagination.
 * GET /api/v1/admin/transactions
 */
async function list(req, res, next) {
  try {
    const {
      page,
      limit,
      participant_id,
      activity_id,
      staff_id,
      type,
      start_date,
      end_date,
      search
    } = req.query;

    const { transactions, pagination } = await refundService.listTransactions({
      page,
      limit,
      participant_id,
      activity_id,
      staff_id,
      type,
      start_date,
      end_date,
      search
    });

    return res.status(200).json(formatSuccess({ transactions }, pagination));
  } catch (error) {
    return next(error);
  }
}

/**
 * Processes an authorized refund for a previous deduction transaction.
 * POST /api/v1/admin/transactions/:id/refund
 */
async function refund(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const staff_id = req.user.id;

    const result = await refundService.processRefund({
      transaction_id: id,
      staff_id,
      notes
    });

    return res.status(200).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns activity transactions summary and breakdown.
 * GET /api/v1/admin/reports/activities/summary
 */
async function getActivitySummary(req, res, next) {
  try {
    const { start_date, end_date, status } = req.query;
    const data = await adminReportService.getActivityTransactionsSummary({
      start_date,
      end_date,
      status
    });
    return res.status(200).json(formatSuccess(data, { generated_at: new Date().toISOString() }));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSummary,
  list,
  refund,
  getActivitySummary
};
