'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('transactions', ['participant_id', 'created_at'], {
      name: 'idx_tx_participant_created'
    });

    await queryInterface.addIndex('transactions', ['staff_id', 'created_at'], {
      name: 'idx_tx_staff_created'
    });

    await queryInterface.addIndex('transactions', ['reference_id', 'type'], {
      name: 'idx_tx_reference_type'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('transactions', 'idx_tx_participant_created');
    await queryInterface.removeIndex('transactions', 'idx_tx_staff_created');
    await queryInterface.removeIndex('transactions', 'idx_tx_reference_type');
  }
};
