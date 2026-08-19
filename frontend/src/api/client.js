const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Custom API client wrapping fetch with JSON envelope parsing and JWT auth header attachment.
 *
 * @param {string} endpoint - Relative API route (e.g. '/api/v1/auth/login')
 * @param {RequestInit} [options]
 * @returns {Promise<any>} data payload on success
 */
export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('sepa_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  let result;
  try {
    result = await response.json();
  } catch (_err) {
    result = null;
  }

  if (!response.ok) {
    const errorMsg = result?.error?.message || `HTTP error! status: ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = result?.error?.code || 'HTTP_ERROR';
    err.details = result?.error?.details;
    throw err;
  }

  return result?.data;
}
