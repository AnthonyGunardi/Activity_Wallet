const { sequelize, createDatabaseInstance, testConnection } = require('../../src/config/database');

describe('Database Configuration & Connection Tests', () => {
  test('should authenticate in test environment with in-memory sqlite', async () => {
    const isConnected = await testConnection();
    expect(isConnected).toBe(true);
    expect(sequelize.getDialect()).toBe('sqlite');
  });

  test('createDatabaseInstance should return sqlite instance for test env', () => {
    const instance = createDatabaseInstance({ env: 'test' });
    expect(instance.getDialect()).toBe('sqlite');
  });

  test('createDatabaseInstance should configure sqlite with storage for development', () => {
    const instance = createDatabaseInstance({ env: 'development', storage: 'custom_test.sqlite' });
    expect(instance.getDialect()).toBe('sqlite');
    expect(typeof instance.options.logging).toBe('function');
    instance.options.logging('Executing query test');
  });

  test('createDatabaseInstance should configure postgres dialect when specified', () => {
    const instance = createDatabaseInstance({
      env: 'production',
      dialect: 'postgres',
      databaseUrl: 'postgres://user:pass@localhost:5432/wallet'
    });
    expect(instance.getDialect()).toBe('postgres');
    expect(typeof instance.options.logging).toBe('function');
    instance.options.logging('Executing postgres query test');
  });

  test('should handle database authentication failure gracefully', async () => {
    const mockSequelize = {
      authenticate: jest.fn().mockRejectedValueOnce(new Error('Connection refused'))
    };

    const isConnected = await testConnection(mockSequelize);
    expect(isConnected).toBe(false);
  });
});
