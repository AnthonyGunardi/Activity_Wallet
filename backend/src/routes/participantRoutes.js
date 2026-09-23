const express = require('express');
const participantController = require('../controllers/participantController');
const { validateParams } = require('../middleware/validate');
const { qrCodeParamSchema } = require('../schemas/participantSchemas');
const { recipientParamSchema } = require('../schemas/transferSchemas');

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

module.exports = router;

