const { DataTypes, Model } = require('sequelize');
const { ActivityStatus } = require('../constants/enums');

class Activity extends Model {}

/**
 * Initializes Activity model
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {typeof Activity}
 */
function initActivity(sequelize) {
  Activity.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(ActivityStatus.ACTIVE, ActivityStatus.INACTIVE),
        allowNull: false,
        defaultValue: ActivityStatus.ACTIVE
      }
    },
    {
      sequelize,
      modelName: 'Activity',
      tableName: 'activities',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['name']
        },
        {
          fields: ['status']
        }
      ]
    }
  );

  return Activity;
}

module.exports = {
  Activity,
  initActivity
};
