import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ParticipantView } from '../../src/pages/ParticipantView';
import { ToastProvider } from '../../src/context/ToastContext';
import { AuthContext } from '../../src/context/authContextInstance';

describe('ParticipantView Page Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockWallet = {
    participant: {
      id: 'p-1',
      name: 'Budi Santoso',
      qr_code: 'SEPA-001',
      initial_credit: 1000000,
      current_balance: 750000,
      total_spent: 250000,
      status: 'ACTIVE'
    },
    activities: [
      { id: 'act-1', name: 'Jet Ski', price: 350000, description: '15 min', is_affordable: true }
    ],
    recent_transactions: [
      { id: 'tx-1', type: 'DEDUCTION', amount: 250000, balance_before: 1000000, balance_after: 750000, activity_name: 'Donut Boat', created_at: '2026-08-19T10:00:00Z' }
    ]
  };

  const renderWithAuth = (ui, authValue = { user: null, isAuthenticated: false, isAdmin: false }) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </AuthContext.Provider>
    );
  };

  it('should prompt token entry or demo participant selection when no token provided', () => {
    renderWithAuth(
      <MemoryRouter initialEntries={['/participant']}>
        <Routes>
          <Route path="/participant" element={<ParticipantView />} />
          <Route path="/participant/:qrCode" element={<ParticipantView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Buka Dompet Peserta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contoh: SEPA-001')).toBeInTheDocument();
  });

  it('should load and render participant wallet when QR token is submitted via input', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockWallet
      })
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/participant']}>
        <Routes>
          <Route path="/participant" element={<ParticipantView />} />
          <Route path="/participant/:qrCode" element={<ParticipantView />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Contoh: SEPA-001');
    const submitBtn = screen.getByRole('button', { name: /lihat saldo/i });

    fireEvent.change(input, { target: { value: 'SEPA-001' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
      expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    });

    // For non-admin, "Ganti Peserta" should NOT be present
    expect(screen.queryByRole('button', { name: /ganti peserta/i })).not.toBeInTheDocument();
  });

  it('should show "Ganti Peserta" button when user is admin and reset wallet when clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockWallet
      })
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/participant/SEPA-001']}>
        <Routes>
          <Route path="/participant" element={<ParticipantView />} />
          <Route path="/participant/:qrCode" element={<ParticipantView />} />
        </Routes>
      </MemoryRouter>,
      { user: { role: 'ADMIN', username: 'admin' }, isAuthenticated: true, isAdmin: true }
    );

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    const gantiPesertaBtn = screen.getByRole('button', { name: /ganti peserta/i });
    expect(gantiPesertaBtn).toBeInTheDocument();

    fireEvent.click(gantiPesertaBtn);

    await waitFor(() => {
      expect(screen.getByText('Buka Dompet Peserta')).toBeInTheDocument();
    });
  });

  it('should display error notice if QR token lookup fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        error: {
          code: 'PARTICIPANT_NOT_FOUND',
          message: 'Peserta dengan kode QR tersebut tidak ditemukan.'
        }
      })
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/participant']}>
        <Routes>
          <Route path="/participant" element={<ParticipantView />} />
          <Route path="/participant/:qrCode" element={<ParticipantView />} />
        </Routes>
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText('Contoh: SEPA-001');
    const submitBtn = screen.getByRole('button', { name: /lihat saldo/i });

    fireEvent.change(input, { target: { value: 'INVALID-TOKEN' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Peserta dengan kode QR tersebut tidak ditemukan.')).toBeInTheDocument();
    });
  });

  it('should open transfer modal when Transfer Saldo button is clicked', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockWallet
      })
    });

    renderWithAuth(
      <MemoryRouter initialEntries={['/participant/SEPA-001']}>
        <Routes>
          <Route path="/participant/:qrCode" element={<ParticipantView />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    const transferBtn = screen.getByRole('button', { name: /transfer saldo/i });
    expect(transferBtn).toBeInTheDocument();
    fireEvent.click(transferBtn);

    await waitFor(() => {
      expect(screen.getByText('Transfer Saldo Aktivitas')).toBeInTheDocument();
    });
  });
});
