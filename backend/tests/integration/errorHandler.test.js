const request = require('supertest');
const express = require('express');
const errorHandler = require('../../src/middleware/errorHandler');
const { AppError } = require('../../src/utils/responseEnvelope');

describe('Centralized Error Handler Middleware Integration', () => {
  let testApp;

  beforeEach(() => {
    testApp = express();
    testApp.use(express.json());

    testApp.get('/test/app-error', () => {
      throw new AppError('INSUFFICIENT_BALANCE', 'Wallet balance is too low', 422, { currentBalance: 50000 });
    });

    testApp.get('/test/app-error-500', () => {
      throw new AppError('CRITICAL_FAILURE', 'Critical internal issue', 500);
    });

    testApp.get('/test/joi-error', () => {
      const error = new Error('Invalid input');
      error.isJoi = true;
      error.details = [{ message: '"price" must be a positive number' }];
      throw error;
    });

    testApp.get('/test/joi-error-no-details', () => {
      const error = new Error('Simple Joi error');
      error.isJoi = true;
      throw error;
    });

    testApp.get('/test/sequelize-validation', () => {
      const error = new Error('Validation failed');
      error.name = 'SequelizeValidationError';
      error.errors = [{ message: 'QR Code must be unique' }];
      throw error;
    });

    testApp.get('/test/sequelize-validation-no-errors', () => {
      const error = new Error('Validation failed without array');
      error.name = 'SequelizeValidationError';
      throw error;
    });

    testApp.get('/test/sequelize-db-error', () => {
      const error = new Error('Connection timeout');
      error.name = 'SequelizeDatabaseError';
      throw error;
    });

    testApp.get('/test/cors-error', () => {
      const error = new Error('CORS error');
      error.name = 'CORS_ERROR';
      error.origin = 'http://malicious-site.com';
      throw error;
    });

    testApp.get('/test/cors-error-alt', () => {
      const error = new Error('CORS alt error');
      error.name = 'CORSError';
      throw error;
    });

    testApp.get('/test/generic-error', () => {
      throw new Error('Unexpected crash');
    });

    testApp.use(errorHandler);
  });

  test('should handle AppError with custom status and payload', async () => {
    const res = await request(testApp).get('/test/app-error');
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'INSUFFICIENT_BALANCE',
        message: 'Wallet balance is too low',
        details: { currentBalance: 50000 }
      }
    });
  });

  test('should handle AppError with 500 status', async () => {
    const res = await request(testApp).get('/test/app-error-500');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('CRITICAL_FAILURE');
  });

  test('should handle Joi validation errors with 400 status', async () => {
    const res = await request(testApp).get('/test/joi-error');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '"price" must be a positive number',
        details: ['"price" must be a positive number']
      }
    });
  });

  test('should handle Joi validation error without details array', async () => {
    const res = await request(testApp).get('/test/joi-error-no-details');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toBe('Simple Joi error');
  });

  test('should handle SequelizeValidationError with 400 status', async () => {
    const res = await request(testApp).get('/test/sequelize-validation');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toContain('QR Code must be unique');
  });

  test('should handle SequelizeValidationError without errors array', async () => {
    const res = await request(testApp).get('/test/sequelize-validation-no-errors');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should handle SequelizeDatabaseError with 500 status', async () => {
    const res = await request(testApp).get('/test/sequelize-db-error');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('DATABASE_ERROR');
  });

  test('should handle CORS errors with 403 status', async () => {
    const res = await request(testApp).get('/test/cors-error');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CORS_FORBIDDEN');
  });

  test('should handle CORSError alt name with 403 status', async () => {
    const res = await request(testApp).get('/test/cors-error-alt');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CORS_FORBIDDEN');
  });

  test('should handle generic unhandled errors with 500 status', async () => {
    const res = await request(testApp).get('/test/generic-error');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
