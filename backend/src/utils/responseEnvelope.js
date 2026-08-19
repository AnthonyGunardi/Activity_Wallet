/**
 * Standard Success Response Formatter
 * Formats outgoing API payloads into { success: true, data, meta }
 *
 * @param {Object|Array} data - The payload data
 * @param {Object} [meta] - Optional pagination or context metadata
 * @returns {{ success: true, data: *, meta?: Object }}
 */
function formatSuccess(data = {}, meta = undefined) {
  const response = {
    success: true,
    data
  };

  if (meta !== undefined && meta !== null) {
    response.meta = meta;
  }

  return response;
}

/**
 * Standard Error Response Formatter
 * Formats API errors into { success: false, error: { code, message, details } }
 *
 * @param {string} code - Machine-readable error code (e.g. INSUFFICIENT_BALANCE)
 * @param {string} message - Human-readable error message
 * @param {Array|Object} [details] - Optional granular validation or context details
 * @returns {{ success: false, error: { code: string, message: string, details?: * } }}
 */
function formatError(code, message, details = undefined) {
  const response = {
    success: false,
    error: {
      code: code || 'INTERNAL_ERROR',
      message: message || 'An unexpected error occurred.'
    }
  };

  if (details !== undefined && details !== null) {
    response.error.details = details;
  }

  return response;
}

/**
 * Custom Application Error
 * Encapsulates HTTP status code and machine-readable error code for centralized handling.
 */
class AppError extends Error {
  /**
   * @param {string} code - Machine-readable error code
   * @param {string} message - Error description
   * @param {number} [statusCode=400] - HTTP status code
   * @param {Array|Object} [details] - Optional validation or contextual details
   */
  constructor(code, message, statusCode = 400, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  formatSuccess,
  formatError,
  AppError
};
