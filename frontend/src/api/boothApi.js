import { apiClient } from './client';

export const boothApi = {
  /**
   * Scans a participant QR token to fetch details and available activity pricing.
   * @param {string} qrCode
   * @returns {Promise<{ participant: Object, eligible_activities: Array }>}
   */
  scanParticipant: (qrCode) => {
    return apiClient('/api/v1/booth/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_code: qrCode })
    });
  },

  /**
   * Executes atomic deduction for chosen activity.
   * @param {{ qr_code: string, activity_id: string, notes?: string }} payload
   * @returns {Promise<{ transaction: Object, updated_balance: number, participant: Object }>}
   */
  createDeduction: (payload) => {
    return apiClient('/api/v1/booth/transactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Retrieves recent transactions processed by this booth/staff.
   * @returns {Promise<{ transactions: Array }>}
   */
  getRecentTransactions: () => {
    return apiClient('/api/v1/booth/transactions/recent', {
      method: 'GET'
    });
  }
};
