const { formatSuccess, formatError, AppError } = require('../../src/utils/responseEnvelope');

describe('Response Envelope Utility Tests', () => {
  describe('formatSuccess', () => {
    test('should format success response without meta', () => {
      const data = { user: 'John Doe', balance: 1000000 };
      const response = formatSuccess(data);

      expect(response).toEqual({
        success: true,
        data: { user: 'John Doe', balance: 1000000 }
      });
      expect(response.meta).toBeUndefined();
    });

    test('should format success response with meta', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const meta = { total: 2, page: 1, limit: 10 };
      const response = formatSuccess(data, meta);

      expect(response).toEqual({
        success: true,
        data,
        meta: { total: 2, page: 1, limit: 10 }
      });
    });

    test('should provide empty object data by default', () => {
      const response = formatSuccess();
      expect(response).toEqual({
        success: true,
        data: {}
      });
    });
  });

  describe('formatError', () => {
    test('should format error response with code and message', () => {
      const response = formatError('INSUFFICIENT_BALANCE', 'Balance is too low');
      expect(response).toEqual({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Balance is too low'
        }
      });
    });

    test('should format error response with details when provided', () => {
      const details = ['Field name is required', 'Field price must be positive'];
      const response = formatError('VALIDATION_ERROR', 'Validation failed', details);
      expect(response).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details
        }
      });
    });

    test('should use fallback code and message if undefined', () => {
      const response = formatError();
      expect(response).toEqual({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred.'
        }
      });
    });
  });

  describe('AppError', () => {
    test('should instantiate AppError with code, message, statusCode, and details', () => {
      const err = new AppError('NOT_FOUND', 'Participant not found', 404, { id: '123' });
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('AppError');
      expect(err.code).toBe('NOT_FOUND');
      expect(err.message).toBe('Participant not found');
      expect(err.statusCode).toBe(404);
      expect(err.details).toEqual({ id: '123' });
    });

    test('should default statusCode to 400', () => {
      const err = new AppError('BAD_REQUEST', 'Invalid input');
      expect(err.statusCode).toBe(400);
      expect(err.details).toBeUndefined();
    });
  });
});
