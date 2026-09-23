const express = require('express');
const participantController = require('../controllers/participantController');
const { validateParams, validateBody } = require('../middleware/validate');
const { qrCodeParamSchema } = require('../schemas/participantSchemas');
const { recipientParamSchema, transferPayloadSchema } = require('../schemas/transferSchemas');

const router = express.Router();

/**
 * @route GET /api/v1/participants/wallet/:qrCode
 * @desc Public participant wallet and activity catalog lookup by QR code token
 */
router.get('/wallet/:qrCode', validateParams(qrCodeParamSchema), participantController.getWallet);

/**
 * @route GET /api/v1/participants/transfer/recipient/:qrCode
 * @desc Lookup and verify recipient participant for peer-to-peer balance transfer
 */
router.get(
  '/transfer/recipient/:qrCode',
  validateParams(recipientParamSchema),
  participantController.getRecipient
);

/**
 * @route POST /api/v1/participants/transfer
 * @desc Atomically transfer activity credit between participants
 */
router.post(
  '/transfer',
  validateBody(transferPayloadSchema),
  participantController.transfer
);

module.exports = router;

