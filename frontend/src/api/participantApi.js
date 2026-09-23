import { apiClient } from './client';

export const participantApi = {
  /**
   * Retrieves participant wallet, activity catalog, and transaction history.
   * @param {string} qrCode
   * @returns {Promise<{ participant: Object, activities: Array, recent_transactions: Array }>}
   */
  getWallet: (qrCode) => {
    return apiClient(`/api/v1/participants/wallet/${encodeURIComponent(qrCode)}`);
  },

  /**
   * Looks up and validates transfer recipient by QR code token.
   * @param {string} qrCode
   * @param {string} [senderQrCode]
   * @returns {Promise<{ recipient: Object }>}
   */
  getTransferRecipient: (qrCode, senderQrCode) => {
    const query = senderQrCode ? `?sender_qr_code=${encodeURIComponent(senderQrCode)}` : '';
    return apiClient(`/api/v1/participants/transfer/recipient/${encodeURIComponent(qrCode)}${query}`);
  },

  /**
   * Atomically executes balance transfer from sender to recipient.
   * @param {{ sender_qr_code: string, recipient_qr_code: string, amount: number, notes?: string }} payload
   * @returns {Promise<{ transfer: Object }>}
   */
  transferBalance: (payload) => {
    return apiClient('/api/v1/participants/transfer', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

