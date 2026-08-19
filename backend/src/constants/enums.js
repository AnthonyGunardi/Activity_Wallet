/**
 * Application Enumerations & Domain Constants
 */

const UserRole = Object.freeze({
  ADMIN: 'ADMIN',
  STAFF: 'STAFF'
});

const ParticipantStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED'
});

const ActivityStatus = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
});

const TransactionType = Object.freeze({
  DEDUCTION: 'DEDUCTION',
  REFUND: 'REFUND',
  ADJUSTMENT: 'ADJUSTMENT'
});

const DEFAULT_INITIAL_CREDIT = 1000000; // Rp1.000.000

module.exports = {
  UserRole,
  ParticipantStatus,
  ActivityStatus,
  TransactionType,
  DEFAULT_INITIAL_CREDIT
};
