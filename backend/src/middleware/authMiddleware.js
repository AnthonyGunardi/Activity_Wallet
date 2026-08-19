const { verifyToken } = require('../services/authService');
const { User } = require('../models');
const { AppError } = require('../utils/responseEnvelope');

/**
 * Authentication Middleware
 * Enforces valid Bearer JWT in the Authorization header.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Header otorisasi tidak ditemukan atau format tidak valid.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('UNAUTHORIZED', 'Pengguna tidak valid atau akun tidak aktif.', 401);
    }

    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Role-Based Access Control Middleware
 * Restricts route access to specified UserRole values.
 *
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Otentikasi diperlukan.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('FORBIDDEN', 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.', 403)
      );
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
