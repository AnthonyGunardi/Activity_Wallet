const express = require('express');
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { loginSchema } = require('../schemas/authSchemas');
const { requireAuth } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user credentials and return JWT
 */
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current authenticated user profile
 */
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
