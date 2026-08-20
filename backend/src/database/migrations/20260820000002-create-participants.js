'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('participants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      qr_code: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true
      },
      initial_credit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000000
      },
      current_balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000000
      },
      total_spent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'BLOCKED'),
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

    await queryInterface.addIndex('participants', ['qr_code'], {
      unique: true,
      name: 'participants_qr_code_unique'
    });

    await queryInterface.addIndex('participants', ['status'], {
      name: 'participants_status_index'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('participants');
  }
};
