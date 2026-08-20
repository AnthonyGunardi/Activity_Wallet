const mysql = require('mysql2/promise');
const { logger } = require('../config/logger');
require('dotenv').config();

/**
 * Creates the MySQL database if it does not already exist.
 * Reads connection settings from environment variables.
 *
 * @param {Object} [options]
 * @param {string} [options.host]
 * @param {number|string} [options.port]
 * @param {string} [options.user]
 * @param {string} [options.password]
 * @param {string} [options.database]
 * @returns {Promise<boolean>}
 */
async function createDatabase(options = {}) {
  const host = options.host || process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(options.port || process.env.DB_PORT || '3306', 10);
  const user = options.user || process.env.DB_USER || 'root';
  const password = options.password !== undefined ? options.password : (process.env.DB_PASSWORD || '');
  const database = options.database || process.env.DB_NAME || 'activity_wallet';

  const dialect = process.env.DB_DIALECT || 'mysql';
  if (dialect !== 'mysql' && dialect !== 'mariadb') {
    logger.info(`Skipping createDatabase for dialect '${dialect}' (only MySQL/MariaDB require explicit creation).`);
    return true;
  }

  logger.info(`Connecting to MySQL server at ${host}:${port} to ensure database '${database}' exists...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    const safeDbName = database.replace(/`/g, '``');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${safeDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    logger.info(`Database '${database}' is ready.`);
    return true;
  } catch (error) {
    logger.error(`Failed to create database '${database}':`, error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  createDatabase()
    .then(() => {
      logger.info('Database creation step finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Database creation failed:', err.message);
      process.exit(1);
    });
}

module.exports = {
  createDatabase
};
