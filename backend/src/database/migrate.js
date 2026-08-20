const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { logger } = require('../config/logger');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Initializes the SequelizeMeta table used to track applied migrations.
 * @param {Sequelize} db
 */
async function ensureMetaTable(db) {
  const queryInterface = db.getQueryInterface();
  const tables = await queryInterface.showAllTables();
  const metaTableName = 'SequelizeMeta';

  const hasMeta = tables.some((t) => {
    const name = typeof t === 'string' ? t : t.tableName || t.name;
    return name.toLowerCase() === metaTableName.toLowerCase();
  });

  if (!hasMeta) {
    await queryInterface.createTable(metaTableName, {
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true
      }
    });
  }
}

/**
 * Gets the list of applied migration file names.
 * @param {Sequelize} db
 * @returns {Promise<string[]>}
 */
async function getAppliedMigrations(db) {
  await ensureMetaTable(db);
  const [results] = await db.query('SELECT name FROM `SequelizeMeta` ORDER BY name ASC;');
  return results.map((r) => r.name);
}

/**
 * Gets all migration files available on disk sorted alphabetically.
 * @returns {string[]}
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();
}

/**
 * Runs all pending migrations in order.
 * @param {Sequelize} [db=sequelize]
 * @returns {Promise<string[]>} List of newly applied migration names
 */
async function runMigrations(db = sequelize) {
  logger.info('Starting database migration...');
  await ensureMetaTable(db);

  const applied = await getAppliedMigrations(db);
  const allFiles = getMigrationFiles();
  const pending = allFiles.filter((f) => !applied.includes(f));

  if (pending.length === 0) {
    logger.info('Database is already up to date. No pending migrations.');
    return [];
  }

  const queryInterface = db.getQueryInterface();
  const newlyApplied = [];

  for (const filename of pending) {
    logger.info(`Migrating: ${filename}`);
    const migrationPath = path.join(MIGRATIONS_DIR, filename);
    const migration = require(migrationPath);

    await migration.up(queryInterface, Sequelize);
    await db.query('INSERT INTO `SequelizeMeta` (name) VALUES (?);', {
      replacements: [filename]
    });

    logger.info(`Migrated:  ${filename}`);
    newlyApplied.push(filename);
  }

  logger.info(`Database migration completed successfully. (${newlyApplied.length} migrations applied)`);
  return newlyApplied;
}

/**
 * Reverts the last applied migration.
 * @param {Sequelize} [db=sequelize]
 * @returns {Promise<string|null>} Undone migration name or null
 */
async function undoLastMigration(db = sequelize) {
  logger.info('Reverting last database migration...');
  await ensureMetaTable(db);

  const applied = await getAppliedMigrations(db);
  if (applied.length === 0) {
    logger.info('No migrations to revert.');
    return null;
  }

  const lastMigrationName = applied[applied.length - 1];
  const migrationPath = path.join(MIGRATIONS_DIR, lastMigrationName);

  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found on disk: ${lastMigrationName}`);
  }

  logger.info(`Reverting: ${lastMigrationName}`);
  const queryInterface = db.getQueryInterface();
  const migration = require(migrationPath);

  await migration.down(queryInterface, Sequelize);
  await db.query('DELETE FROM `SequelizeMeta` WHERE name = ?;', {
    replacements: [lastMigrationName]
  });

  logger.info(`Reverted:  ${lastMigrationName}`);
  return lastMigrationName;
}

/**
 * Reverts all applied migrations in reverse order.
 * @param {Sequelize} [db=sequelize]
 * @returns {Promise<string[]>}
 */
async function resetMigrations(db = sequelize) {
  logger.info('Resetting all migrations...');
  const reverted = [];
  let last;
  do {
    last = await undoLastMigration(db);
    if (last) reverted.push(last);
  } while (last);

  logger.info(`All migrations reset. (${reverted.length} reverted)`);
  return reverted;
}

if (require.main === module) {
  const action = process.argv[2] || 'up';

  let operation;
  if (action === 'undo') {
    operation = undoLastMigration();
  } else if (action === 'reset') {
    operation = resetMigrations();
  } else {
    operation = runMigrations();
  }

  operation
    .then(() => {
      logger.info('Migration task completed.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Migration task failed:', err);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
  undoLastMigration,
  resetMigrations,
  getAppliedMigrations,
  getMigrationFiles
};
