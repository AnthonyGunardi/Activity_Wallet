import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../src/components/common/Header';
import { AuthProvider } from '../../src/context/AuthContext';
import * as useAuthModule from '../../src/hooks/useAuth';

describe('Header Component Tests', () => {
  it('should render brand logo, navigation links, and login button when unauthenticated', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Sepa Island')).toBeInTheDocument();
    expect(screen.getByText('Activity Wallet')).toBeInTheDocument();
    expect(screen.getByText('Dompet Peserta')).toBeInTheDocument();
    expect(screen.getByText('Scanner Booth')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should render user role badge and logout button when authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { name: 'Admin Budi', role: 'ADMIN' },
      isAuthenticated: true,
      logout: vi.fn()
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Budi')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
  });
});
