import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../src/components/common/ProtectedRoute';
import * as useAuthModule from '../../src/hooks/useAuth';

describe('ProtectedRoute Component Tests', () => {
  it('should render loading spinner when auth isLoading is true', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Memuat sesi...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect unauthenticated users to /login', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Target')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated with valid role', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'ADMIN', username: 'admin' }
    });

    render(
      <MemoryRouter initialEntries={['/admin-page']}>
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
  });

  it('should deny access when user role is not in allowedRoles', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { role: 'STAFF', username: 'staff1' }
    });

    render(
      <MemoryRouter initialEntries={['/admin-page']}>
        <Routes>
          <Route
            path="/admin-page"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Admin Only Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Home Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
  });
});
