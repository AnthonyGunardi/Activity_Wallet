const express = require('express');
const participantController = require('../controllers/participantController');
const { validateParams } = require('../middleware/validate');
const { qrCodeParamSchema } = require('../schemas/participantSchemas');

const router = express.Router();

/**
 * @route GET /api/v1/participants/wallet/:qrCode
 * @desc Public participant wallet and activity catalog lookup by QR code token
 */
router.get('/wallet/:qrCode', validateParams(qrCodeParamSchema), participantController.getWallet);

module.exports = router;
