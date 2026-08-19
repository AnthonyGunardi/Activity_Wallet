const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { UserRole } = require('../constants/enums');

class User extends Model {
  /**
   * Compares plain password with stored bcrypt hash.
   * @param {string} candidatePassword
   * @returns {Promise<boolean>}
   */
  async comparePassword(candidatePassword) {
    if (!this.password_hash || !candidatePassword) return false;
    return bcrypt.compare(candidatePassword, this.password_hash);
  }
}

/**
 * Hashes password if plaintext
 * @param {User} user
 */
async function hashPasswordHook(user) {
  if (user.password_hash && !user.password_hash.startsWith('$2')) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
}

/**
 * Initializes User model
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {typeof User}
 */
function initUser(sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 64]
        }
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      role: {
        type: DataTypes.ENUM(UserRole.ADMIN, UserRole.STAFF),
        allowNull: false,
        defaultValue: UserRole.STAFF
      },
      assigned_booth_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      hooks: {
        beforeCreate: hashPasswordHook,
        beforeUpdate: async (user) => {
          if (user.changed('password_hash')) {
            await hashPasswordHook(user);
          }
        }
      }
    }
  );

  return User;
}

module.exports = {
  User,
  initUser,
  hashPasswordHook
};
