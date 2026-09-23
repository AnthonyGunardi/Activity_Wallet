const participantService = require('../services/participantService');
const { formatSuccess } = require('../utils/responseEnvelope');

/**
 * Handles participant wallet lookup by QR code parameter.
 * GET /api/v1/participants/wallet/:qrCode
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getWallet(req, res, next) {
  try {
    const { qrCode } = req.params;
    const wallet = await participantService.getWalletByQrCode(qrCode);
    return res.status(200).json(formatSuccess(wallet));
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles participant transfer recipient verification by QR code parameter.
 * GET /api/v1/participants/transfer/recipient/:qrCode
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function getRecipient(req, res, next) {
  try {
    const { qrCode } = req.params;
    const { sender_qr_code } = req.query;
    const recipient = await participantService.getTransferRecipient(qrCode, sender_qr_code);
    return res.status(200).json(formatSuccess({ recipient }));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWallet,
  getRecipient
};

