import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../../src/api/authApi';
import { apiClient } from '../../src/api/client';

describe('API Client and authApi Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test('apiClient should attach Authorization header if token exists and parse success response', async () => {
    localStorage.setItem('sepa_auth_token', 'test-token');

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { user: { id: '1', name: 'Test User' } }
      })
    });

    const result = await authApi.getMe();
    expect(result).toEqual({ user: { id: '1', name: 'Test User' } });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        })
      })
    );
  });

  test('apiClient should throw formatted error on non-ok HTTP response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      })
    });

    await expect(authApi.login('baduser', 'badpass')).rejects.toMatchObject({
      message: 'Invalid credentials',
      status: 401,
      code: 'UNAUTHORIZED'
    });
  });

  test('apiClient should handle non-json error responses', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Not JSON');
      }
    });

    await expect(apiClient('/api/v1/error')).rejects.toMatchObject({
      message: 'HTTP error! status: 500',
      status: 500,
      code: 'HTTP_ERROR'
    });
  });
});
