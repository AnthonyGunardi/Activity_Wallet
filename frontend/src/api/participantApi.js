import { apiClient } from './client';

export const participantApi = {
  /**
   * Retrieves participant wallet, activity catalog, and transaction history.
   * @param {string} qrCode
   * @returns {Promise<{ participant: Object, activities: Array, recent_transactions: Array }>}
   */
  getWallet: (qrCode) => {
    return apiClient(`/api/v1/participants/wallet/${encodeURIComponent(qrCode)}`);
  }
};
