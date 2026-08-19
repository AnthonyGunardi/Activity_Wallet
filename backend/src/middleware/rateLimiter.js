const rateLimit = require('express-rate-limit');
const { formatError } = require('../utils/responseEnvelope');

const apiLimitHandler = (req, res) => {
  res.status(429).json(formatError('TOO_MANY_REQUESTS', 'Too many requests, please try again later.'));
};

const authLimitHandler = (req, res) => {
  res.status(429).json(formatError('TOO_MANY_LOGIN_ATTEMPTS', 'Too many login attempts, please try again later.'));
};

const skipInTest = () => process.env.NODE_ENV === 'test';

/**
 * Standard API rate limiter
 * Protects endpoints from excessive requests while permitting normal event traffic.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: apiLimitHandler
});

/**
 * Strict rate limiter for authentication / sensitive routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  handler: authLimitHandler
});

module.exports = {
  apiLimiter,
  authLimiter,
  apiLimitHandler,
  authLimitHandler,
  skipInTest
};
