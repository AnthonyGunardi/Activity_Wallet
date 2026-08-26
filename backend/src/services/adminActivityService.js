const { Op } = require('sequelize');
const { Activity } = require('../models');
const { ActivityStatus } = require('../constants/enums');
const { AppError } = require('../utils/responseEnvelope');

/**
 * Lists all activities, optionally filtered by status (ACTIVE / INACTIVE).
 *
 * @param {Object} [filter={}]
 * @param {string} [filter.status]
 * @returns {Promise<Array<Activity>>}
 */
async function listActivities({ status } = {}) {
  const where = {};
  if (status) {
    where.status = status;
  }

  const activities = await Activity.findAll({
    where,
    order: [['id', 'ASC']]
  });

  return activities;
}

/**
 * Retrieves a single activity by its primary key ID.
 *
 * @param {string} id
 * @returns {Promise<Activity>}
 * @throws {AppError} 404 ACTIVITY_NOT_FOUND
 */
async function getActivityById(id) {
  const activity = await Activity.findByPk(id);
  if (!activity) {
    throw new AppError('ACTIVITY_NOT_FOUND', 'Aktivitas tidak ditemukan.', 404);
  }
  return activity;
}

/**
 * Creates a new water sport activity in the catalog.
 * Validates unique activity name to prevent duplicate offerings.
 *
 * @param {Object} payload
 * @param {string} payload.name
 * @param {number} payload.price
 * @param {string} [payload.description]
 * @param {string} [payload.status]
 * @returns {Promise<Activity>}
 * @throws {AppError} 409 ACTIVITY_ALREADY_EXISTS
 */
async function createActivity({ name, price, description, status = ActivityStatus.ACTIVE }) {
  const trimmedName = name.trim();

  const existing = await Activity.findOne({
    where: { name: trimmedName }
  });

  if (existing) {
    throw new AppError('ACTIVITY_ALREADY_EXISTS', 'Aktivitas dengan nama tersebut sudah terdaftar.', 409);
  }

  const activity = await Activity.create({
    name: trimmedName,
    price: Number(price),
    description: description ? description.trim() : null,
    status
  });

  return activity;
}

/**
 * Updates an existing activity's pricing, details, or active status.
 * Checks for name collision if the name is modified.
 *
 * @param {string} id
 * @param {Object} payload
 * @param {string} [payload.name]
 * @param {number} [payload.price]
 * @param {string} [payload.description]
 * @param {string} [payload.status]
 * @returns {Promise<Activity>}
 * @throws {AppError} 404 ACTIVITY_NOT_FOUND
 * @throws {AppError} 409 ACTIVITY_ALREADY_EXISTS
 */
async function updateActivity(id, { name, price, description, status }) {
  const activity = await Activity.findByPk(id);

  if (!activity) {
    throw new AppError('ACTIVITY_NOT_FOUND', 'Aktivitas tidak ditemukan.', 404);
  }

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (trimmedName !== activity.name) {
      const existing = await Activity.findOne({
        where: {
          name: trimmedName,
          id: { [Op.ne]: id }
        }
      });

      if (existing) {
        throw new AppError('ACTIVITY_ALREADY_EXISTS', 'Aktivitas dengan nama tersebut sudah terdaftar.', 409);
      }

      activity.name = trimmedName;
    }
  }

  if (price !== undefined) {
    activity.price = Number(price);
  }

  if (description !== undefined) {
    activity.description = description ? description.trim() : null;
  }

  if (status !== undefined) {
    activity.status = status;
  }

  await activity.save();
  return activity;
}

module.exports = {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity
};
