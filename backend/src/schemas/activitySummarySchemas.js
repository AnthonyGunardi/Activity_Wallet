const Joi = require('joi');
const { ActivityStatus } = require('../constants/enums');

const activitySummaryQuerySchema = Joi.object({
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  status: Joi.string().valid(ActivityStatus.ACTIVE, ActivityStatus.INACTIVE).optional()
});

const exportActivitiesQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'excel', 'xlsx', 'xls').default('csv'),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  status: Joi.string().valid(ActivityStatus.ACTIVE, ActivityStatus.INACTIVE).optional()
});

module.exports = {
  activitySummaryQuerySchema,
  exportActivitiesQuerySchema
};
