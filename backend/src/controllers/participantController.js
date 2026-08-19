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

module.exports = {
  getWallet
};
