const express = require('express');
const adminParticipantController = require('../controllers/adminParticipantController');
const adminActivityController = require('../controllers/adminActivityController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  listParticipantsQuerySchema,
  createParticipantSchema,
  bulkParticipantsSchema,
  updateStatusSchema
} = require('../schemas/adminSchemas');
const {
  listActivitiesQuerySchema,
  createActivitySchema,
  updateActivitySchema
} = require('../schemas/activitySchemas');
const { UserRole } = require('../constants/enums');

const router = express.Router();

// Enforce Admin role for all routes under /api/v1/admin
router.use(requireAuth, requireRole(UserRole.ADMIN));

/**
 * @route GET /api/v1/admin/participants
 * @desc List participants with pagination, search, and status filter
 */
router.get(
  '/participants',
  validateQuery(listParticipantsQuerySchema),
  adminParticipantController.list
);

/**
 * @route POST /api/v1/admin/participants
 * @desc Create a single participant
 */
router.post(
  '/participants',
  validateBody(createParticipantSchema),
  adminParticipantController.create
);

/**
 * @route POST /api/v1/admin/participants/bulk
 * @desc Bulk import participants in single transaction
 */
router.post(
  '/participants/bulk',
  validateBody(bulkParticipantsSchema),
  adminParticipantController.bulkCreate
);

/**
 * @route PUT /api/v1/admin/participants/:id/reissue-qr
 * @desc Reissue participant QR token while preserving balance & ledger history
 */
router.put('/participants/:id/reissue-qr', adminParticipantController.reissueQr);

/**
 * @route PUT /api/v1/admin/participants/:id/status
 * @desc Update participant status (ACTIVE / BLOCKED)
 */
router.put(
  '/participants/:id/status',
  validateBody(updateStatusSchema),
  adminParticipantController.updateStatus
);

/**
 * @route GET /api/v1/admin/activities
 * @desc List all activities with optional status filter
 */
router.get(
  '/activities',
  validateQuery(listActivitiesQuerySchema),
  adminActivityController.list
);

/**
 * @route GET /api/v1/admin/activities/:id
 * @desc Retrieve single activity details by ID
 */
router.get('/activities/:id', adminActivityController.getById);

/**
 * @route POST /api/v1/admin/activities
 * @desc Create a new water sport activity
 */
router.post(
  '/activities',
  validateBody(createActivitySchema),
  adminActivityController.create
);

/**
 * @route PUT /api/v1/admin/activities/:id
 * @desc Update an existing activity's pricing, details, or active status
 */
router.put(
  '/activities/:id',
  validateBody(updateActivitySchema),
  adminActivityController.update
);

module.exports = router;
