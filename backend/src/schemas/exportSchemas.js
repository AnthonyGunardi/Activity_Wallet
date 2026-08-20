const Joi = require('joi');
const { ParticipantStatus, TransactionType } = require('../constants/enums');

const exportParticipantsQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'excel', 'xlsx', 'xls').default('csv'),
  search: Joi.string().trim().allow(null, '').optional(),
  status: Joi.string().valid(ParticipantStatus.ACTIVE, ParticipantStatus.BLOCKED).optional()
});

const exportTransactionsQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'excel', 'xlsx', 'xls').default('csv'),
  participant_id: Joi.string().trim().optional(),
  activity_id: Joi.string().trim().optional(),
  staff_id: Joi.string().trim().optional(),
  type: Joi.string().valid(
    TransactionType.DEDUCTION,
    TransactionType.REFUND,
    TransactionType.ADJUSTMENT
  ).optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  search: Joi.string().trim().allow(null, '').optional()
});

module.exports = {
  exportParticipantsQuerySchema,
  exportTransactionsQuerySchema
};
