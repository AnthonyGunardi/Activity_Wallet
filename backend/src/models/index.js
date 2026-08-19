const { sequelize } = require('../config/database');
const { initUser } = require('./User');
const { initParticipant } = require('./Participant');
const { initActivity } = require('./Activity');
const { initTransaction } = require('./Transaction');

/**
 * Initializes all Sequelize models and registers entity associations.
 *
 * @param {import('sequelize').Sequelize} [dbInstance=sequelize]
 * @returns {{
 *   sequelize: import('sequelize').Sequelize,
 *   User: ReturnType<typeof initUser>,
 *   Participant: ReturnType<typeof initParticipant>,
 *   Activity: ReturnType<typeof initActivity>,
 *   Transaction: ReturnType<typeof initTransaction>
 * }}
 */
function setupModels(dbInstance = sequelize) {
  const models = {
    User: initUser(dbInstance),
    Participant: initParticipant(dbInstance),
    Activity: initActivity(dbInstance),
    Transaction: initTransaction(dbInstance)
  };

  // Participant <-> Transaction (1:M)
  models.Participant.hasMany(models.Transaction, {
    foreignKey: 'participant_id',
    as: 'transactions'
  });
  models.Transaction.belongsTo(models.Participant, {
    foreignKey: 'participant_id',
    as: 'participant'
  });

  // Activity <-> Transaction (1:M)
  models.Activity.hasMany(models.Transaction, {
    foreignKey: 'activity_id',
    as: 'transactions'
  });
  models.Transaction.belongsTo(models.Activity, {
    foreignKey: 'activity_id',
    as: 'activity'
  });

  // User (Staff/Admin) <-> Transaction (1:M)
  models.User.hasMany(models.Transaction, {
    foreignKey: 'staff_id',
    as: 'transactions'
  });
  models.Transaction.belongsTo(models.User, {
    foreignKey: 'staff_id',
    as: 'staff'
  });

  // Self-referencing Transaction (for Refunds / Adjustments)
  models.Transaction.belongsTo(models.Transaction, {
    foreignKey: 'reference_id',
    as: 'reference_transaction'
  });
  models.Transaction.hasMany(models.Transaction, {
    foreignKey: 'reference_id',
    as: 'refund_transactions'
  });

  return {
    sequelize: dbInstance,
    ...models
  };
}

const db = setupModels(sequelize);

module.exports = {
  ...db,
  setupModels
};
