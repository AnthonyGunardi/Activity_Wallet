import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../src/context/AuthContext';
import { useAuth } from '../../src/hooks/useAuth';
import { authApi } from '../../src/api/authApi';

const TestAuthComponent = () => {
  const { user, isAuthenticated, isAdmin, isStaff, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Loading Auth...</div>;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'}</div>
      <div data-testid="user-role">{user?.role || 'NONE'}</div>
      <div data-testid="is-admin">{isAdmin ? 'YES' : 'NO'}</div>
      <div data-testid="is-staff">{isStaff ? 'YES' : 'NO'}</div>
      <button onClick={() => login('admin', 'admin123')}>Do Login</button>
      <button onClick={logout}>Do Logout</button>
    </div>
  );
};

describe('AuthContext & useAuth Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize as logged out when no token exists in localStorage', async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');
  });

  it('should restore session from localStorage when valid token exists', async () => {
    localStorage.setItem('sepa_auth_token', 'valid-jwt-token');
    vi.spyOn(authApi, 'getMe').mockResolvedValueOnce({
      user: { id: '1', username: 'admin', role: 'ADMIN', name: 'Admin User' }
    });

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('LOGGED_IN');
    expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('YES');
  });

  it('should clear token and stay logged out when token verification fails', async () => {
    localStorage.setItem('sepa_auth_token', 'expired-jwt-token');
    vi.spyOn(authApi, 'getMe').mockRejectedValueOnce(new Error('Token expired'));

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');
    expect(localStorage.getItem('sepa_auth_token')).toBeNull();
  });

  it('should login successfully and update state and localStorage', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValueOnce({
      token: 'new-token-123',
      user: { id: '2', username: 'staff_jetski', role: 'STAFF', name: 'Staff Jet Ski' }
    });

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Do Login'));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_IN');
    expect(screen.getByTestId('user-role')).toHaveTextContent('STAFF');
    expect(screen.getByTestId('is-staff')).toHaveTextContent('YES');
    expect(localStorage.getItem('sepa_auth_token')).toBe('new-token-123');

    act(() => {
      fireEvent.click(screen.getByText('Do Logout'));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');
    expect(localStorage.getItem('sepa_auth_token')).toBeNull();
  });

  it('useAuth should throw error when used outside AuthProvider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BadAuth = () => {
      useAuth();
      return null;
    };

    expect(() => render(<BadAuth />)).toThrow('useAuth must be used within an AuthProvider');
    consoleErrorSpy.mockRestore();
  });
});
