const express = require('express');
const adminParticipantController = require('../controllers/adminParticipantController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  listParticipantsQuerySchema,
  createParticipantSchema,
  bulkParticipantsSchema,
  updateStatusSchema
} = require('../schemas/adminSchemas');
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

module.exports = router;
