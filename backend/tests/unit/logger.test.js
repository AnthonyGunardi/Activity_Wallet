const { logger, createTransports, formatConsoleOutput } = require('../../src/config/logger');

describe('Logger Configuration Unit Tests', () => {
  test('logger should be initialized with custom levels', () => {
    expect(logger.levels).toHaveProperty('error', 0);
    expect(logger.levels).toHaveProperty('warn', 1);
    expect(logger.levels).toHaveProperty('info', 2);
    expect(logger.levels).toHaveProperty('http', 3);
    expect(logger.levels).toHaveProperty('debug', 4);
  });

  test('createTransports should return console only in test mode', () => {
    const transports = createTransports('test');
    expect(transports.length).toBe(1);
  });

  test('createTransports should include rotate files in production mode', () => {
    const transports = createTransports('production');
    expect(transports.length).toBe(3);
  });

  test('formatConsoleOutput should format with and without metadata and stack', () => {
    const resultWithMeta = formatConsoleOutput({
      timestamp: '2026-08-19 12:00:00',
      level: 'info',
      message: 'User logged in',
      userId: 123
    });
    expect(resultWithMeta).toContain('[2026-08-19 12:00:00] info: User logged in {"userId":123}');

    const resultWithStack = formatConsoleOutput({
      timestamp: '2026-08-19 12:00:00',
      level: 'error',
      message: 'Failed',
      stack: 'Error: Failed stack trace'
    });
    expect(resultWithStack).toContain('[2026-08-19 12:00:00] error: Error: Failed stack trace');
  });

  test('logger methods should execute without throwing', () => {
    expect(() => {
      logger.info('Test info message', { userId: 123 });
      logger.warn('Test warn message');
      logger.error('Test error message', { error: new Error('test') });
      logger.debug('Test debug message');
    }).not.toThrow();
  });
});
