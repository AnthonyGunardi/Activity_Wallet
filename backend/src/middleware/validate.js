const { formatError } = require('../utils/responseEnvelope');

/**
 * Validates request body against a Joi schema
 * @param {import('joi').ObjectSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json(formatError('VALIDATION_ERROR', error.details[0]?.message, details));
    }

    req.body = value;
    return next();
  };
}

/**
 * Validates request query parameters against a Joi schema
 * @param {import('joi').ObjectSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json(formatError('VALIDATION_ERROR', error.details[0]?.message, details));
    }

    req.query = value;
    return next();
  };
}

/**
 * Validates request route parameters against a Joi schema
 * @param {import('joi').ObjectSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json(formatError('VALIDATION_ERROR', error.details[0]?.message, details));
    }

    req.params = value;
    return next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
