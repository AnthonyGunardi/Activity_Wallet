const { DataTypes, Model } = require('sequelize');
const { TransactionType } = require('../constants/enums');

class Transaction extends Model {}

/**
 * Initializes Transaction model (Immutable Ledger)
 * Enforces append-only integrity with hooks preventing updates and deletions.
 *
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {typeof Transaction}
 */
function initTransaction(sequelize) {
  Transaction.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      participant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'participants',
          key: 'id'
        }
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'activities',
          key: 'id'
        }
      },
      staff_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      type: {
        type: DataTypes.ENUM(
          TransactionType.DEDUCTION,
          TransactionType.REFUND,
          TransactionType.ADJUSTMENT,
          TransactionType.TRANSFER_OUT,
          TransactionType.TRANSFER_IN
        ),
        allowNull: false
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      balance_before: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      balance_after: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id'
        }
      },
      notes: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      underscored: true,
      timestamps: true,
      updatedAt: false, // Immutable: write-once ledger
      indexes: [
        {
          fields: ['participant_id']
        },
        {
          fields: ['staff_id']
        },
        {
          fields: ['activity_id']
        },
        {
          fields: ['reference_id']
        },
        {
          fields: ['type']
        },
        {
          fields: ['created_at']
        }
      ],
      hooks: {
        beforeUpdate: () => {
          throw new Error('IMMUTABLE_LEDGER_VIOLATION: Transaction records cannot be updated.');
        },
        beforeDestroy: () => {
          throw new Error('IMMUTABLE_LEDGER_VIOLATION: Transaction records cannot be deleted.');
        }
      }
    }
  );

  return Transaction;
}

module.exports = {
  Transaction,
  initTransaction
};
