'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      participant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'participants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      activity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'activities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      staff_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('DEDUCTION', 'REFUND', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN'),
        allowNull: false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      balance_before: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      balance_after: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      notes: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('transactions', ['participant_id'], {
      name: 'transactions_participant_id_index'
    });

    await queryInterface.addIndex('transactions', ['staff_id'], {
      name: 'transactions_staff_id_index'
    });

    await queryInterface.addIndex('transactions', ['activity_id'], {
      name: 'transactions_activity_id_index'
    });

    await queryInterface.addIndex('transactions', ['reference_id'], {
      name: 'transactions_reference_id_index'
    });

    await queryInterface.addIndex('transactions', ['type'], {
      name: 'transactions_type_index'
    });

    await queryInterface.addIndex('transactions', ['created_at'], {
      name: 'transactions_created_at_index'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('transactions');
  }
};
