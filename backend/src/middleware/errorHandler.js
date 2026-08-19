const { logger } = require('../config/logger');
const { formatError, AppError } = require('../utils/responseEnvelope');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Centralized Express Error Handler Middleware
 * Maps known error types to standard error response envelope { success: false, error: { code, message } }
 */
const errorHandler = (err, req, res, _next) => {
  // CORS Error
  if (err.name === 'CORSError' || err.name === 'CORS_ERROR') {
    logger.warn(`CORS blocked origin: ${err.origin || req.headers.origin}`);
    return res.status(403).json(formatError('CORS_FORBIDDEN', 'Request blocked by CORS policy'));
  }

  // AppError (Custom operational error)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`AppError [${err.code}]: ${err.message}`, { stack: err.stack, details: err.details });
    } else {
      logger.warn(`AppError [${err.code}]: ${err.message}`, { details: err.details });
    }
    return res.status(err.statusCode).json(formatError(err.code, err.message, err.details));
  }

  // Joi Validation Error
  if (err.isJoi) {
    const details = err.details ? err.details.map((d) => d.message) : [err.message];
    logger.warn(`Validation error on ${req.method} ${req.originalUrl}:`, { details });
    return res.status(400).json(formatError('VALIDATION_ERROR', err.details?.[0]?.message || err.message, details));
  }

  // Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map((e) => e.message) : [err.message];
    logger.warn(`Sequelize validation error: ${messages.join(', ')}`);
    return res.status(400).json(formatError('VALIDATION_ERROR', messages.join(', '), messages));
  }

  // Sequelize Database Errors
  if (err.name === 'SequelizeDatabaseError') {
    logger.error(`Sequelize database error: ${err.message}`, { stack: err.stack });
    const message = isProduction ? 'Database operation failed' : `Database Error: ${err.message}`;
    return res.status(500).json(formatError('DATABASE_ERROR', message));
  }

  // Unhandled / Internal Server Error
  logger.error(`Unhandled Exception: ${err.message}`, {
    stack: err.stack,
    name: err.name,
    path: req.originalUrl,
    method: req.method
  });

  const fallbackMessage = isProduction ? 'An internal server error occurred.' : err.message;
  return res.status(err.status || err.statusCode || 500).json(formatError('INTERNAL_SERVER_ERROR', fallbackMessage));
};

module.exports = errorHandler;
