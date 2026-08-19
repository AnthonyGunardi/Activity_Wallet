const { apiLimitHandler, authLimitHandler, skipInTest } = require('../../src/middleware/rateLimiter');

describe('Rate Limiter Middleware Tests', () => {
  test('apiLimitHandler should return 429 formatted error', () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    apiLimitHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later.'
      }
    });
  });

  test('authLimitHandler should return 429 formatted error', () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    authLimitHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'TOO_MANY_LOGIN_ATTEMPTS',
        message: 'Too many login attempts, please try again later.'
      }
    });
  });

  test('skipInTest should return true when NODE_ENV is test', () => {
    expect(skipInTest()).toBe(true);
  });
});
