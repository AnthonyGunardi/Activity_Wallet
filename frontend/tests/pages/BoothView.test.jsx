import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BoothView } from '../../src/pages/BoothView';
import { ToastProvider } from '../../src/context/ToastContext';
import { AuthContext } from '../../src/context/authContextInstance';

describe('BoothView Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockUser = {
    id: 'staff-1',
    name: 'Booth Staff 1',
    role: 'STAFF'
  };

  const mockScanResult = {
    participant: {
      id: 'p-1',
      name: 'Ahmad Fauzi',
      qr_code: 'SEPA-BOOTH-001',
      current_balance: 750000,
      status: 'ACTIVE'
    },
    eligible_activities: [
      { id: 'act-1', name: 'Jet Ski', price: 350000, is_affordable: true }
    ]
  };

  const mockDeductionResult = {
    transaction: {
      id: 'tx-101',
      type: 'DEDUCTION',
      amount: 350000,
      balance_before: 750000,
      balance_after: 400000,
      activity_name: 'Jet Ski',
      created_at: '2026-08-19T11:00:00Z'
    },
    updated_balance: 400000,
    participant: {
      id: 'p-1',
      name: 'Ahmad Fauzi',
      qr_code: 'SEPA-BOOTH-001',
      current_balance: 400000
    }
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ user: mockUser, token: 'fake-token' }}>
        <ToastProvider>
          <MemoryRouter>
            <BoothView />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };

  it('should allow staff to input QR token manually and preview participant details', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/booth/transactions/recent')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { transactions: [] } })
        });
      }
      if (url.includes('/api/v1/booth/scan')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockScanResult })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderComponent();

    expect(screen.getByText('Scanner Aktivitas')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Contoh: SEPA-001');
    const scanBtn = screen.getByRole('button', { name: /verifikasi peserta/i });

    fireEvent.change(input, { target: { value: 'SEPA-BOOTH-001' } });
    fireEvent.click(scanBtn);

    await waitFor(() => {
      expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
      expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
    });
  });

  it('should complete full deduction flow: scan -> select activity -> confirm -> display success receipt', async () => {
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (url.includes('/api/v1/booth/transactions/recent')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: { transactions: [] } })
        });
      }
      if (url.includes('/api/v1/booth/scan')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockScanResult })
        });
      }
      if (url.includes('/api/v1/booth/transactions') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockDeductionResult })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderComponent();

    // 1. Manual scan
    const input = screen.getByPlaceholderText('Contoh: SEPA-001');
    const scanBtn = screen.getByRole('button', { name: /verifikasi peserta/i });
    fireEvent.change(input, { target: { value: 'SEPA-BOOTH-001' } });
    fireEvent.click(scanBtn);

    // 2. Select activity from preview modal
    await waitFor(() => {
      expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
    });

    const selectActBtn = screen.getByRole('button', { name: /pilih jet ski/i });
    fireEvent.click(selectActBtn);

    // 3. Confirm modal
    expect(screen.getByText('Konfirmasi Potong Saldo')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /konfirmasi & potong saldo/i });
    fireEvent.click(confirmBtn);

    // 4. Success receipt displayed
    await waitFor(() => {
      expect(screen.getByText('Transaksi Berhasil')).toBeInTheDocument();
      expect(screen.getByText('Rp 400.000')).toBeInTheDocument(); // new balance
    });
  });
});
