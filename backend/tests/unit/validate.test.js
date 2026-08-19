const Joi = require('joi');
const { validateBody, validateQuery, validateParams } = require('../../src/middleware/validate');

describe('Joi Validation Middleware Unit Tests', () => {
  const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().min(0)
  });

  describe('validateBody', () => {
    test('should call next and strip unknowns when valid', () => {
      const req = { body: { name: 'Alice', age: 25, extra: 'ignored' } };
      const res = {};
      const next = jest.fn();

      validateBody(schema)(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'Alice', age: 25 });
    });

    test('should return 400 with details when invalid', () => {
      const req = { body: { age: -5 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateBody(schema)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    test('should call next when query is valid', () => {
      const req = { query: { name: 'Bob' } };
      const res = {};
      const next = jest.fn();

      validateQuery(schema)(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.query).toEqual({ name: 'Bob' });
    });

    test('should return 400 when query is invalid', () => {
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateQuery(schema)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateParams', () => {
    test('should call next when params are valid', () => {
      const req = { params: { name: 'Charlie' } };
      const res = {};
      const next = jest.fn();

      validateParams(schema)(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.params).toEqual({ name: 'Charlie' });
    });

    test('should return 400 when params are invalid', () => {
      const req = { params: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      validateParams(schema)(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
