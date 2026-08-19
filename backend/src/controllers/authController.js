const authService = require('../services/authService');
const { formatSuccess } = require('../utils/responseEnvelope');

/**
 * Handles user login
 * POST /api/v1/auth/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return res.status(200).json(formatSuccess(result));
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles fetching current authenticated user profile
 * GET /api/v1/auth/me
 */
async function getMe(req, res, next) {
  try {
    const userProfile = await authService.getUserProfile(req.user.id);
    return res.status(200).json(formatSuccess({ user: userProfile }));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  getMe
};
