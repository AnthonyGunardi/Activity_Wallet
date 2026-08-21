const adminParticipantService = require('../services/adminParticipantService');
const { formatSuccess } = require('../utils/responseEnvelope');

/**
 * Lists participants with search, filter, and pagination.
 * GET /api/v1/admin/participants
 */
async function list(req, res, next) {
  try {
    const { page, limit, search, status } = req.query;
    const { participants, pagination } = await adminParticipantService.listParticipants({
      page,
      limit,
      search,
      status
    });
    return res.status(200).json(formatSuccess({ participants }, pagination));
  } catch (error) {
    return next(error);
  }
}

/**
 * Creates a single new participant.
 * POST /api/v1/admin/participants
 */
async function create(req, res, next) {
  try {
    const participant = await adminParticipantService.createParticipant(req.body);
    return res.status(201).json(formatSuccess(participant));
  } catch (error) {
    return next(error);
  }
}

/**
 * Bulk creates participants.
 * POST /api/v1/admin/participants/bulk
 */
async function bulkCreate(req, res, next) {
  try {
    const { participants } = req.body;
    const result = await adminParticipantService.bulkCreateParticipants(participants);
    return res.status(201).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Reissues a new QR code token for a participant.
 * PUT /api/v1/admin/participants/:id/reissue-qr
 */
async function reissueQr(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminParticipantService.reissueQrCode(id);
    return res.status(200).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Retrieves a single participant by ID.
 * GET /api/v1/admin/participants/:id
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const participant = await adminParticipantService.getParticipantById(id);
    return res.status(200).json(formatSuccess(participant));
  } catch (error) {
    return next(error);
  }
}

/**
 * Updates an existing participant.
 * PUT /api/v1/admin/participants/:id
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const participant = await adminParticipantService.updateParticipant(id, req.body);
    return res.status(200).json(formatSuccess(participant));
  } catch (error) {
    return next(error);
  }
}

/**
 * Deletes a participant (only if no transactions exist).
 * DELETE /api/v1/admin/participants/:id
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminParticipantService.deleteParticipant(id);
    return res.status(200).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Updates participant status (ACTIVE / BLOCKED).
 * PUT /api/v1/admin/participants/:id/status
 */
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const participant = await adminParticipantService.updateParticipantStatus(id, status);
    return res.status(200).json(formatSuccess(participant));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  bulkCreate,
  update,
  remove,
  reissueQr,
  updateStatus
};
