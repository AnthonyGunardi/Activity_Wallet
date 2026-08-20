const adminActivityService = require('../services/adminActivityService');
const { formatSuccess } = require('../utils/responseEnvelope');

/**
 * Lists all activities for admin catalog management.
 * GET /api/v1/admin/activities
 */
async function list(req, res, next) {
  try {
    const { status } = req.query;
    const activities = await adminActivityService.listActivities({ status });
    return res.status(200).json(formatSuccess({ activities }));
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieves a single activity by ID.
 * GET /api/v1/admin/activities/:id
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const activity = await adminActivityService.getActivityById(id);
    return res.status(200).json(formatSuccess(activity));
  } catch (error) {
    return next(error);
  }
}

/**
 * Creates a new water sport activity.
 * POST /api/v1/admin/activities
 */
async function create(req, res, next) {
  try {
    const activity = await adminActivityService.createActivity(req.body);
    return res.status(201).json(formatSuccess(activity));
  } catch (error) {
    return next(error);
  }
}

/**
 * Updates an activity's details, pricing, or status.
 * PUT /api/v1/admin/activities/:id
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const activity = await adminActivityService.updateActivity(id, req.body);
    return res.status(200).json(formatSuccess(activity));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update
};
