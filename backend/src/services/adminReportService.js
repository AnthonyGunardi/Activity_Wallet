const { Participant, Activity, Transaction } = require('../models');
const { ParticipantStatus, ActivityStatus, TransactionType } = require('../constants/enums');

/**
 * Computes aggregated real-time dashboard metrics across all participants,
 * water sport activities, and transactions for event management oversight.
 *
 * @returns {Promise<{
 *   total_participants: number,
 *   active_participants: number,
 *   total_allocated_credit: number,
 *   total_spent_credit: number,
 *   remaining_balance: number,
 *   total_transactions: number,
 *   total_deductions: number,
 *   total_refunds: number,
 *   total_activities: number,
 *   active_activities: number
 * }>}
 */
async function getDashboardSummary() {
  const [
    totalParticipants,
    activeParticipants,
    totalAllocatedCredit,
    totalSpentCredit,
    remainingBalance,
    totalTransactions,
    totalDeductions,
    totalRefunds,
    totalActivities,
    activeActivities
  ] = await Promise.all([
    Participant.count(),
    Participant.count({ where: { status: ParticipantStatus.ACTIVE } }),
    Participant.sum('initial_credit'),
    Participant.sum('total_spent'),
    Participant.sum('current_balance'),
    Transaction.count(),
    Transaction.count({ where: { type: TransactionType.DEDUCTION } }),
    Transaction.count({ where: { type: TransactionType.REFUND } }),
    Activity.count(),
    Activity.count({ where: { status: ActivityStatus.ACTIVE } })
  ]);

  return {
    total_participants: totalParticipants || 0,
    active_participants: activeParticipants || 0,
    total_allocated_credit: Number(totalAllocatedCredit) || 0,
    total_spent_credit: Number(totalSpentCredit) || 0,
    remaining_balance: Number(remainingBalance) || 0,
    total_transactions: totalTransactions || 0,
    total_deductions: totalDeductions || 0,
    total_refunds: totalRefunds || 0,
    total_activities: totalActivities || 0,
    active_activities: activeActivities || 0
  };
}

module.exports = {
  getDashboardSummary
};
