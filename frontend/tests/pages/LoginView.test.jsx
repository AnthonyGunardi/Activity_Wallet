import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginView } from '../../src/pages/LoginView';
import { ToastProvider } from '../../src/context/ToastContext';
import * as useAuthModule from '../../src/hooks/useAuth';

describe('LoginView Component Tests', () => {
  const renderLoginView = (mockAuth = {}) => {
    const defaultAuth = {
      login: vi.fn(),
      isAuthenticated: false,
      user: null,
      ...mockAuth
    };

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue(defaultAuth);

    return render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/booth" element={<div>Booth Scanner View</div>} />
            <Route path="/admin" element={<div>Admin Dashboard View</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('should render login form with title and quick demo buttons', () => {
    renderLoginView();

    expect(screen.getByText('Login Petugas')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument();
    expect(screen.getByText('Admin Supervisor')).toBeInTheDocument();
    expect(screen.getByText('Staff Jet Ski')).toBeInTheDocument();
  });

  it('should autofill inputs when clicking quick demo account pills', () => {
    renderLoginView();

    const adminButton = screen.getByText('Admin Supervisor');
    fireEvent.click(adminButton);

    expect(screen.getByLabelText('Username')).toHaveValue('admin');
    expect(screen.getByLabelText('Kata Sandi')).toHaveValue('admin123');

    const staffButton = screen.getByText('Staff Jet Ski');
    fireEvent.click(staffButton);

    expect(screen.getByLabelText('Username')).toHaveValue('staff_jetski');
    expect(screen.getByLabelText('Kata Sandi')).toHaveValue('staff123');
  });

  it('should display error message on empty submit', async () => {
    renderLoginView();

    const submitBtn = screen.getByText('Masuk ke Sistem');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Silakan masukkan username dan kata sandi.')).toBeInTheDocument();
  });

  it('should login and navigate on successful submission', async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce({
      id: '1',
      username: 'admin',
      name: 'Supervisor',
      role: 'ADMIN'
    });

    renderLoginView({ login: mockLogin });

    fireEvent.click(screen.getByText('Admin Supervisor'));

    await act(async () => {
      fireEvent.click(screen.getByText('Masuk ke Sistem'));
    });

    expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
    expect(screen.getByText('Admin Dashboard View')).toBeInTheDocument();
  });

  it('should display error banner when login fails', async () => {
    const mockLogin = vi.fn().mockRejectedValueOnce(new Error('Username atau kata sandi tidak valid.'));

    renderLoginView({ login: mockLogin });

    fireEvent.click(screen.getByText('Admin Supervisor'));

    await act(async () => {
      fireEvent.click(screen.getByText('Masuk ke Sistem'));
    });

    expect(screen.getByText('Username atau kata sandi tidak valid.')).toBeInTheDocument();
  });
});
