const { DataTypes, Model } = require('sequelize');
const { ParticipantStatus, DEFAULT_INITIAL_CREDIT } = require('../constants/enums');

class Participant extends Model {}

/**
 * Initializes Participant model
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {typeof Participant}
 */
function initParticipant(sequelize) {
  Participant.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      qr_code: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      initial_credit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: DEFAULT_INITIAL_CREDIT,
        validate: {
          min: 0
        }
      },
      current_balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: DEFAULT_INITIAL_CREDIT,
        validate: {
          min: 0
        }
      },
      total_spent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      status: {
        type: DataTypes.ENUM(ParticipantStatus.ACTIVE, ParticipantStatus.BLOCKED),
        allowNull: false,
        defaultValue: ParticipantStatus.ACTIVE
      }
    },
    {
      sequelize,
      modelName: 'Participant',
      tableName: 'participants',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['qr_code']
        },
        {
          fields: ['status']
        }
      ]
    }
  );

  return Participant;
}

module.exports = {
  Participant,
  initParticipant
};
