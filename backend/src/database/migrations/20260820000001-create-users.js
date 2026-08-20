'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'STAFF'),
        allowNull: false,
        defaultValue: 'STAFF'
      },
      assigned_booth_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'users_username_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
