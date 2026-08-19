import { apiClient } from './client';

export const authApi = {
  /**
   * Performs staff or admin login
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ token: string, user: Object }>}
   */
  async login(username, password) {
    return apiClient('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  /**
   * Fetches current authenticated user profile
   * @returns {Promise<{ user: Object }>}
   */
  async getMe() {
    return apiClient('/api/v1/auth/me');
  }
};
