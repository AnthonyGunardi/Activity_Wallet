const { Op } = require('sequelize');
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

/**
 * Computes aggregated financial and operational metrics per activity (wahana),
 * including deductions, refunds, gross/net amounts, unique participants, and share %.
 *
 * @param {Object} [filters]
 * @param {string} [filters.start_date] - Optional start date ISO string
 * @param {string} [filters.end_date] - Optional end date ISO string
 * @param {string} [filters.status] - Optional activity status filter (ACTIVE / INACTIVE)
 * @returns {Promise<{
 *   summary: {
 *     total_activities: number,
 *     total_deductions: number,
 *     total_refunds: number,
 *     total_gross_amount: number,
 *     total_refund_amount: number,
 *     total_net_amount: number,
 *     total_unique_participants: number
 *   },
 *   activities: Array<{
 *     id: string,
 *     name: string,
 *     price: number,
 *     status: string,
 *     deduction_count: number,
 *     refund_count: number,
 *     gross_amount: number,
 *     refund_amount: number,
 *     net_amount: number,
 *     unique_participants_count: number,
 *     share_percentage: number
 *   }>
 * }>}
 */
async function getActivityTransactionsSummary({ start_date, end_date, status } = {}) {
  const activityWhere = {};
  if (status) {
    activityWhere.status = status;
  }

  const activities = await Activity.findAll({
    where: activityWhere,
    order: [['name', 'ASC']]
  });

  const txWhere = {
    activity_id: { [Op.ne]: null }
  };

  if (start_date || end_date) {
    txWhere.created_at = {};
    if (start_date) txWhere.created_at[Op.gte] = new Date(start_date);
    if (end_date) txWhere.created_at[Op.lte] = new Date(end_date);
  }

  const transactions = await Transaction.findAll({
    where: txWhere,
    attributes: ['id', 'participant_id', 'activity_id', 'type', 'amount', 'created_at']
  });

  const txByActivity = new Map();
  for (const act of activities) {
    txByActivity.set(act.id, []);
  }

  const overallDeductionParticipants = new Set();

  for (const tx of transactions) {
    if (txByActivity.has(tx.activity_id)) {
      txByActivity.get(tx.activity_id).push(tx);
    }
    if (tx.type === TransactionType.DEDUCTION) {
      overallDeductionParticipants.add(tx.participant_id);
    }
  }

  let totalGrossAmount = 0;
  let totalRefundAmount = 0;
  let totalDeductions = 0;
  let totalRefunds = 0;

  const activityStats = activities.map((act) => {
    const actTxs = txByActivity.get(act.id) || [];
    let deductionCount = 0;
    let refundCount = 0;
    let grossAmount = 0;
    let refundAmount = 0;
    const uniqueParticipants = new Set();

    for (const tx of actTxs) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === TransactionType.DEDUCTION) {
        deductionCount += 1;
        grossAmount += amt;
        uniqueParticipants.add(tx.participant_id);
      } else if (tx.type === TransactionType.REFUND) {
        refundCount += 1;
        refundAmount += amt;
      }
    }

    const netAmount = grossAmount - refundAmount;

    totalGrossAmount += grossAmount;
    totalRefundAmount += refundAmount;
    totalDeductions += deductionCount;
    totalRefunds += refundCount;

    return {
      id: act.id,
      name: act.name,
      price: act.price,
      status: act.status,
      deduction_count: deductionCount,
      refund_count: refundCount,
      gross_amount: grossAmount,
      refund_amount: refundAmount,
      net_amount: netAmount,
      unique_participants_count: uniqueParticipants.size,
      share_percentage: 0
    };
  });

  const totalNetAmount = totalGrossAmount - totalRefundAmount;

  for (const item of activityStats) {
    if (totalNetAmount > 0 && item.net_amount > 0) {
      item.share_percentage = Number(((item.net_amount / totalNetAmount) * 100).toFixed(2));
    } else {
      item.share_percentage = 0;
    }
  }

  activityStats.sort((a, b) => {
    if (b.net_amount !== a.net_amount) {
      return b.net_amount - a.net_amount;
    }
    if (b.deduction_count !== a.deduction_count) {
      return b.deduction_count - a.deduction_count;
    }
    return a.name.localeCompare(b.name);
  });

  return {
    summary: {
      total_activities: activities.length,
      total_deductions: totalDeductions,
      total_refunds: totalRefunds,
      total_gross_amount: totalGrossAmount,
      total_refund_amount: totalRefundAmount,
      total_net_amount: totalNetAmount,
      total_unique_participants: overallDeductionParticipants.size
    },
    activities: activityStats
  };
}

module.exports = {
  getDashboardSummary,
  getActivityTransactionsSummary
};

