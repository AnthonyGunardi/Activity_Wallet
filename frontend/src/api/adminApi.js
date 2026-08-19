import { apiClient } from './client';

export const adminApi = {
  /**
   * Lists participants with search, status filtering, and pagination.
   * @param {{ page?: number, limit?: number, search?: string, status?: string }} [params={}]
   * @returns {Promise<{ success: boolean, data: { participants: Array }, meta: { total: number, page: number, limit: number, totalPages: number } }>}
   */
  getParticipants: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/api/v1/admin/participants${queryString}`, { method: 'GET' });
  },

  /**
   * Creates a single participant.
   * @param {{ name: string, initial_credit?: number, qr_code?: string }} payload
   * @returns {Promise<Object>}
   */
  createParticipant: (payload) => {
    return apiClient('/api/v1/admin/participants', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Bulk registers multiple participants.
   * @param {Array<{ name: string, initial_credit?: number, qr_code?: string }>} participants
   * @returns {Promise<{ created_count: number, participants: Array }>}
   */
  bulkCreateParticipants: (participants) => {
    return apiClient('/api/v1/admin/participants/bulk', {
      method: 'POST',
      body: JSON.stringify({ participants })
    });
  },

  /**
   * Reissues a new unique QR code token for a participant while preserving balance.
   * @param {string} participantId
   * @returns {Promise<{ participant: Object, previous_qr_code: string, new_qr_code: string }>}
   */
  reissueQr: (participantId) => {
    return apiClient(`/api/v1/admin/participants/${participantId}/reissue-qr`, {
      method: 'PUT'
    });
  },

  /**
   * Updates participant status (ACTIVE / BLOCKED).
   * @param {string} participantId
   * @param {'ACTIVE' | 'BLOCKED'} status
   * @returns {Promise<Object>}
   */
  updateStatus: (participantId, status) => {
    return apiClient(`/api/v1/admin/participants/${participantId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};
