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

  test('createDatabaseInstance should configure mysql dialect by default in development', () => {
    const instance = createDatabaseInstance({
      env: 'development',
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: 'activity_wallet',
      username: 'root',
      password: ''
    });
    expect(instance.getDialect()).toBe('mysql');
    expect(typeof instance.options.logging).toBe('function');
    instance.options.logging('Executing mysql query test');
  });

  test('createDatabaseInstance should configure mysql via databaseUrl', () => {
    const instance = createDatabaseInstance({
      env: 'production',
      dialect: 'mysql',
      databaseUrl: 'mysql://root:password@127.0.0.1:3306/activity_wallet'
    });
    expect(instance.getDialect()).toBe('mysql');
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

  test('createDatabaseInstance should configure postgres with discrete parameters', () => {
    const instance = createDatabaseInstance({
      env: 'production',
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'activity_wallet',
      username: 'postgres',
      password: 'password'
    });
    expect(instance.getDialect()).toBe('postgres');
  });

  test('createDatabaseInstance should fallback to sqlite when storage is explicitly provided', () => {
    const instance = createDatabaseInstance({
      env: 'development',
      dialect: 'sqlite',
      storage: 'custom_test.sqlite'
    });
    expect(instance.getDialect()).toBe('sqlite');
  });

  test('should handle database authentication failure gracefully', async () => {
    const mockSequelize = {
      authenticate: jest.fn().mockRejectedValueOnce(new Error('Connection refused'))
    };

    const isConnected = await testConnection(mockSequelize);
    expect(isConnected).toBe(false);
  });

  test('sequelizeCliConfig should expose valid config for development, test, and production', () => {
    const cliConfig = require('../../src/config/sequelizeCliConfig');
    expect(cliConfig.development).toBeDefined();
    expect(cliConfig.test).toBeDefined();
    expect(cliConfig.production).toBeDefined();
    expect(cliConfig.test.dialect).toBe('sqlite');
    expect(cliConfig.development.dialect).toBe('mysql');
  });
});
