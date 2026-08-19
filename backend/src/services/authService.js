const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../utils/responseEnvelope');

const JWT_SECRET = process.env.JWT_SECRET || 'sepa-island-secret-key-activity-wallet-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generates a signed JWT token for a given user.
 * @param {User} user
 * @returns {string}
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      assigned_booth_id: user.assigned_booth_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verifies and decodes a JWT token.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_err) {
    throw new AppError('UNAUTHORIZED', 'Token otentikasi tidak valid atau telah kedaluwarsa.', 401);
  }
}

/**
 * Authenticates user credentials and returns session token and profile.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ token: string, user: Object }>}
 */
async function login(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Username atau kata sandi tidak valid.', 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('INVALID_CREDENTIALS', 'Username atau kata sandi tidak valid.', 401);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('ACCOUNT_INACTIVE', 'Akun Anda telah dinonaktifkan oleh administrator.', 403);
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      assigned_booth_id: user.assigned_booth_id,
      status: user.status
    }
  };
}

/**
 * Retrieves the current user profile by primary key.
 *
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function getUserProfile(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.status !== 'ACTIVE') {
    throw new AppError('USER_NOT_FOUND', 'Pengguna tidak ditemukan atau tidak aktif.', 404);
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    assigned_booth_id: user.assigned_booth_id,
    status: user.status
  };
}

module.exports = {
  generateToken,
  verifyToken,
  login,
  getUserProfile,
  JWT_SECRET
};
