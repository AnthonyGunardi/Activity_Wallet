const exportService = require('../services/exportService');

/**
 * Handles CSV / Excel report export for participant balances.
 * GET /api/v1/admin/reports/participants/export
 */
async function exportParticipants(req, res, next) {
  try {
    const { format, search, status } = req.query;
    const result = await exportService.generateParticipantsExport({ format, search, status });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.data);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles CSV / Excel report export for transaction audit ledger.
 * GET /api/v1/admin/reports/transactions/export
 */
async function exportTransactions(req, res, next) {
  try {
    const {
      format,
      participant_id,
      activity_id,
      staff_id,
      type,
      start_date,
      end_date,
      search
    } = req.query;

    const result = await exportService.generateTransactionsExport({
      format,
      participant_id,
      activity_id,
      staff_id,
      type,
      start_date,
      end_date,
      search
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  exportParticipants,
  exportTransactions
};
