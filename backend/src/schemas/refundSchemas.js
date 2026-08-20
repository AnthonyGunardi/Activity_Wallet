const Joi = require('joi');
const { TransactionType } = require('../constants/enums');

const listTransactionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  participant_id: Joi.string().uuid().optional(),
  activity_id: Joi.string().uuid().optional(),
  staff_id: Joi.string().uuid().optional(),
  type: Joi.string().valid(
    TransactionType.DEDUCTION,
    TransactionType.REFUND,
    TransactionType.ADJUSTMENT
  ).optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  search: Joi.string().trim().allow(null, '').optional()
});

const processRefundSchema = Joi.object({
  notes: Joi.string().trim().max(255).allow(null, '').optional().messages({
    'string.max': 'Catatan refund maksimal 255 karakter.'
  })
});

module.exports = {
  listTransactionsQuerySchema,
  processRefundSchema
};
