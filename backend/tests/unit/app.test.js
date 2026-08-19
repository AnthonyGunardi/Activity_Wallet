const { shouldSkipMorgan, corsOriginResolver } = require('../../src/app');

describe('App Helper Functions Unit Tests', () => {
  test('shouldSkipMorgan should return true for status < 400 and false for >= 400', () => {
    expect(shouldSkipMorgan({}, { statusCode: 200 })).toBe(true);
    expect(shouldSkipMorgan({}, { statusCode: 404 })).toBe(false);
    expect(shouldSkipMorgan({}, { statusCode: 500 })).toBe(false);
  });

  test('corsOriginResolver should permit null origin and localhost', (done) => {
    corsOriginResolver(null, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
    });

    corsOriginResolver('http://127.0.0.1:3000', (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  test('corsOriginResolver should reject unauthorized domains', (done) => {
    corsOriginResolver('http://unauthorized-domain.com', (err, allow) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.name).toBe('CORS_ERROR');
      expect(allow).toBe(false);
      done();
    });
  });
});
