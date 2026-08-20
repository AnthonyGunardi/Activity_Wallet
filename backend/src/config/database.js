const path = require('path');
const { Sequelize } = require('sequelize');
const { logger } = require('./logger');

/**
 * Initializes and configures Sequelize instance according to runtime environment.
 * Default database dialect is MySQL with fallback support for PostgreSQL and test SQLite.
 *
 * @param {Object} [options]
 * @param {string} [options.env]
 * @param {string} [options.dialect]
 * @param {string} [options.databaseUrl]
 * @param {string} [options.storage]
 * @param {string} [options.host]
 * @param {number|string} [options.port]
 * @param {string} [options.database]
 * @param {string} [options.username]
 * @param {string} [options.password]
 * @returns {Sequelize}
 */
function createDatabaseInstance(options = {}) {
  const env = options.env || process.env.NODE_ENV || 'development';
  const dialect = options.dialect || (env === 'test' ? 'sqlite' : (process.env.DB_DIALECT || 'mysql'));
  const databaseUrl = options.databaseUrl || (env === 'test' ? undefined : process.env.DATABASE_URL);

  // In test environment without explicit external dialect, default to in-memory sqlite
  if (env === 'test' && (!options.dialect || options.dialect === 'sqlite')) {
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

  // 1. Connection via DATABASE_URL
  if (databaseUrl) {
    const resolvedDialect = dialect === 'sqlite' ? 'sqlite' : (dialect === 'postgres' ? 'postgres' : 'mysql');
    return new Sequelize(databaseUrl, {
      dialect: resolvedDialect,
      logging: (msg) => logger.debug(msg),
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        min: parseInt(process.env.DB_POOL_MIN || '0', 10),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      }
    });
  }

  // 2. Discrete connection parameters for MySQL
  if (dialect === 'mysql' || dialect === 'mariadb') {
    const host = options.host || process.env.DB_HOST || '127.0.0.1';
    const port = parseInt(options.port || process.env.DB_PORT || '3306', 10);
    const database = options.database || process.env.DB_NAME || 'activity_wallet';
    const username = options.username || process.env.DB_USER || 'root';
    const password = options.password !== undefined ? options.password : (process.env.DB_PASSWORD || '');

    return new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'mysql',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        min: parseInt(process.env.DB_POOL_MIN || '0', 10),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      }
    });
  }

  // 3. Discrete connection parameters for PostgreSQL
  if (dialect === 'postgres') {
    const host = options.host || process.env.DB_HOST || '127.0.0.1';
    const port = parseInt(options.port || process.env.DB_PORT || '5432', 10);
    const database = options.database || process.env.DB_NAME || 'activity_wallet';
    const username = options.username || process.env.DB_USER || 'postgres';
    const password = options.password !== undefined ? options.password : (process.env.DB_PASSWORD || '');

    return new Sequelize(database, username, password, {
      host,
      port,
      dialect: 'postgres',
      logging: (msg) => logger.debug(msg),
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        min: parseInt(process.env.DB_POOL_MIN || '0', 10),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
      }
    });
  }

  // 4. Fallback SQLite
  const storage = options.storage || process.env.DB_STORAGE;
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
