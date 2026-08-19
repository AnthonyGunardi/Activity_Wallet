const path = require('path');
const { Sequelize } = require('sequelize');
const { logger } = require('./logger');

/**
 * Initializes and configures Sequelize instance according to runtime environment.
 *
 * @param {Object} [options]
 * @param {string} [options.env]
 * @param {string} [options.dialect]
 * @param {string} [options.databaseUrl]
 * @param {string} [options.storage]
 * @returns {Sequelize}
 */
function createDatabaseInstance(options = {}) {
  const env = options.env || process.env.NODE_ENV || 'development';
  const dialect = options.dialect || process.env.DB_DIALECT;
  const databaseUrl = options.databaseUrl || process.env.DATABASE_URL;
  const storage = options.storage || process.env.DB_STORAGE;

  if (env === 'test') {
    return new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      pool: {
        max: 1,
        min: 1,
        idle: 10000
      }
    });
  }

  if (dialect === 'postgres' && databaseUrl) {
    return new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }

  const dbPath = storage || path.join(__dirname, '..', '..', 'activity_wallet.sqlite');
  return new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: (msg) => logger.debug(msg)
  });
}

const sequelize = createDatabaseInstance();

/**
 * Tests the database connection.
 * @param {Sequelize} [instance]
 * @returns {Promise<boolean>}
 */
async function testConnection(instance = sequelize) {
  try {
    await instance.authenticate();
    logger.info('Database connection established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  createDatabaseInstance,
  testConnection
};
