const { Sequelize } = require('sequelize');
const {
  runMigrations,
  undoLastMigration,
  resetMigrations,
  getAppliedMigrations,
  getMigrationFiles
} = require('../../src/database/migrate');
const { createDatabase } = require('../../src/database/createDatabase');

describe('Sequelize Migrations Unit Tests', () => {
  let testDb;

  beforeEach(() => {
    testDb = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    });
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.close();
    }
  });

  test('getMigrationFiles should return all 5 migration files in order', () => {
    const files = getMigrationFiles();
    expect(files.length).toBe(5);
    expect(files[0]).toContain('create-users');
    expect(files[1]).toContain('create-participants');
    expect(files[2]).toContain('create-activities');
    expect(files[3]).toContain('create-transactions');
    expect(files[4]).toContain('add-transaction-composite-indexes');
  });

  test('runMigrations should execute all migrations and create all tables', async () => {
    const applied = await runMigrations(testDb);
    expect(applied.length).toBe(5);

    const queryInterface = testDb.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) => (typeof t === 'string' ? t : t.tableName || t.name).toLowerCase());

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('participants');
    expect(tableNames).toContain('activities');
    expect(tableNames).toContain('transactions');
    expect(tableNames).toContain('sequelizemeta');

    const recorded = await getAppliedMigrations(testDb);
    expect(recorded.length).toBe(5);
  });

  test('runMigrations should be idempotent when no pending migrations exist', async () => {
    await runMigrations(testDb);
    const secondRun = await runMigrations(testDb);
    expect(secondRun.length).toBe(0);
  });

  test('undoLastMigration should revert the last applied migration', async () => {
    await runMigrations(testDb);
    const reverted = await undoLastMigration(testDb);
    expect(reverted).toContain('add-transaction-composite-indexes');

    const applied = await getAppliedMigrations(testDb);
    expect(applied.length).toBe(4);
    expect(applied.some((f) => f.includes('add-transaction-composite-indexes'))).toBe(false);
  });

  test('resetMigrations should revert all applied migrations in reverse order', async () => {
    await runMigrations(testDb);
    const reverted = await resetMigrations(testDb);
    expect(reverted.length).toBe(5);

    const applied = await getAppliedMigrations(testDb);
    expect(applied.length).toBe(0);
  });

  test('createDatabase should return true when dialect is sqlite or postgres', async () => {
    const originalDialect = process.env.DB_DIALECT;
    process.env.DB_DIALECT = 'sqlite';
    const result = await createDatabase();
    expect(result).toBe(true);
    process.env.DB_DIALECT = originalDialect;
  });
});
