const { Op } = require('sequelize');
const { Participant, Activity, Transaction, sequelize } = require('../models');
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
  const [participantSummary, transactionSummary, activitySummary] = await Promise.all([
    Participant.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END")), 'active'],
        [sequelize.fn('SUM', sequelize.col('initial_credit')), 'total_allocated_credit'],
        [sequelize.fn('SUM', sequelize.col('total_spent')), 'total_spent_credit'],
        [sequelize.fn('SUM', sequelize.col('current_balance')), 'remaining_balance']
      ],
      raw: true
    }),
    Transaction.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN type = 'DEDUCTION' THEN 1 ELSE 0 END")), 'deductions'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN type = 'REFUND' THEN 1 ELSE 0 END")), 'refunds']
      ],
      raw: true
    }),
    Activity.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END")), 'active']
      ],
      raw: true
    })
  ]);

  const totalAllocatedCredit = Number(participantSummary && participantSummary.total_allocated_credit) || 0;
  const totalSpentCredit = Number(participantSummary && participantSummary.total_spent_credit) || 0;
  const remainingBalance = Number(participantSummary && participantSummary.remaining_balance) || 0;
  const activeActivities = Number(activitySummary && activitySummary.active) || 0;

  return {
    total_participants: Number(participantSummary && participantSummary.total) || 0,
    active_participants: Number(participantSummary && participantSummary.active) || 0,
    total_allocated_credit: totalAllocatedCredit,
    total_spent_credit: totalSpentCredit,
    remaining_balance: remainingBalance,
    total_transactions: Number(transactionSummary && transactionSummary.total) || 0,
    total_deductions: Number(transactionSummary && transactionSummary.deductions) || 0,
    total_refunds: Number(transactionSummary && transactionSummary.refunds) || 0,
    total_activities: Number(activitySummary && activitySummary.total) || 0,
    active_activities: activeActivities,
    total_credit_issued: totalAllocatedCredit,
    total_credit_spent: totalSpentCredit,
    remaining_liability: remainingBalance,
    active_activities_count: activeActivities
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

  if (activities.length === 0) {
    return {
      summary: {
        total_activities: 0,
        total_deductions: 0,
        total_refunds: 0,
        total_gross_amount: 0,
        total_refund_amount: 0,
        total_net_amount: 0,
        total_unique_participants: 0
      },
      activities: []
    };
  }

  const txWhere = {
    activity_id: { [Op.in]: activities.map((a) => a.id) }
  };

  if (start_date || end_date) {
    txWhere.created_at = {};
    if (start_date) txWhere.created_at[Op.gte] = new Date(start_date);
    if (end_date) txWhere.created_at[Op.lte] = new Date(end_date);
  }

  const [txStats, uniqueParticipantStats, overallUniqueResult] = await Promise.all([
    Transaction.findAll({
      where: txWhere,
      attributes: [
        'activity_id',
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['activity_id', 'type'],
      raw: true
    }),
    Transaction.findAll({
      where: {
        ...txWhere,
        type: TransactionType.DEDUCTION
      },
      attributes: [
        'activity_id',
        [sequelize.literal('COUNT(DISTINCT participant_id)'), 'unique_count']
      ],
      group: ['activity_id'],
      raw: true
    }),
    Transaction.findOne({
      where: {
        ...txWhere,
        type: TransactionType.DEDUCTION
      },
      attributes: [
        [sequelize.literal('COUNT(DISTINCT participant_id)'), 'total_unique']
      ],
      raw: true
    })
  ]);

  const statsMap = new Map();
  for (const stat of txStats) {
    if (!statsMap.has(stat.activity_id)) {
      statsMap.set(stat.activity_id, {});
    }
    statsMap.get(stat.activity_id)[stat.type] = {
      count: Number(stat.count) || 0,
      total_amount: Number(stat.total_amount) || 0
    };
  }

  const uniqueMap = new Map();
  for (const u of uniqueParticipantStats) {
    uniqueMap.set(u.activity_id, Number(u.unique_count) || 0);
  }

  let totalGrossAmount = 0;
  let totalRefundAmount = 0;
  let totalDeductions = 0;
  let totalRefunds = 0;

  const activityStats = activities.map((act) => {
    const actData = statsMap.get(act.id) || {};
    const deductionData = actData[TransactionType.DEDUCTION] || { count: 0, total_amount: 0 };
    const refundData = actData[TransactionType.REFUND] || { count: 0, total_amount: 0 };

    const deductionCount = deductionData.count;
    const grossAmount = deductionData.total_amount;
    const refundCount = refundData.count;
    const refundAmount = refundData.total_amount;
    const netAmount = grossAmount - refundAmount;
    const uniqueParticipantsCount = uniqueMap.get(act.id) || 0;

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
      unique_participants_count: uniqueParticipantsCount,
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
      total_unique_participants: Number(overallUniqueResult && overallUniqueResult.total_unique) || 0
    },
    activities: activityStats
  };
}

module.exports = {
  getDashboardSummary,
  getActivityTransactionsSummary
};

