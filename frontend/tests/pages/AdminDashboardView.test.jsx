import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardView } from '../../src/pages/admin/AdminDashboardView';
import { ToastProvider } from '../../src/context/ToastContext';
import { AuthContext } from '../../src/context/authContextInstance';

describe('AdminDashboardView Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockAdminUser = {
    id: 'admin-1',
    name: 'Admin Supervisor',
    role: 'ADMIN'
  };

  const mockSummary = {
    total_participants: 80,
    active_participants: 78,
    total_allocated_credit: 80000000,
    total_spent_credit: 25000000,
    remaining_balance: 55000000,
    total_transactions: 120,
    total_deductions: 110,
    total_refunds: 10,
    total_activities: 6,
    active_activities: 5
  };

  const mockTransactionsList = {
    transactions: [
      {
        id: 'tx-001',
        participant_id: 'p-1',
        activity_id: 'act-1',
        staff_id: 'staff-1',
        type: 'DEDUCTION',
        amount: 350000,
        balance_before: 1000000,
        balance_after: 650000,
        notes: 'Jet ski',
        created_at: '2026-08-20T10:00:00Z',
        participant: { id: 'p-1', name: 'Budi Santoso', qr_code: 'SEPA-001' },
        activity: { id: 'act-1', name: 'Jet Ski', price: 350000 },
        staff: { id: 'staff-1', name: 'Booth Staff 1' },
        refund_transactions: []
      }
    ]
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ user: mockAdminUser, token: 'admin-token' }}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminDashboardView />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };

  it('should render executive KPI summary cards and transaction audit ledger', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockSummary })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockTransactionsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      });

    renderComponent();

    expect(screen.getByText('Ringkasan Kredit & Transaksi')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Rp 80.000.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 25.000.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 55.000.000')).toBeInTheDocument();
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('-Rp 350.000')).toBeInTheDocument();
    });
  });

  it('should process authorized refund when clicking refund button and confirming modal', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: mockSummary })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockTransactionsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            refund_transaction: { id: 'tx-ref-1', type: 'REFUND', amount: 350000 },
            restored_balance: 1000000
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            ...mockSummary,
            total_spent_credit: 24650000,
            remaining_balance: 55350000
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            transactions: [
              {
                ...mockTransactionsList.transactions[0],
                refund_transactions: [{ id: 'tx-ref-1', type: 'REFUND', amount: 350000 }]
              }
            ]
          },
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    const refundBtn = screen.getByRole('button', { name: /refund transaksi tx-001/i });
    fireEvent.click(refundBtn);

    expect(screen.getByText('Konfirmasi Otorisasi Refund')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /setujui & refund/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/refund berhasil diproses/i)).toBeInTheDocument();
    });
  });

  it('filters ledger by activity when Filter Ledger button is clicked in ActivityRecapSection', async () => {
    const mockActivityRecap = {
      summary: {
        total_activities: 1,
        total_deductions: 5,
        total_refunds: 0,
        total_gross_amount: 1750000,
        total_refund_amount: 0,
        total_net_amount: 1750000,
        total_unique_participants: 5
      },
      activities: [
        {
          id: 'act-jetski',
          name: 'Jet Ski Special',
          price: 350000,
          status: 'ACTIVE',
          deduction_count: 5,
          refund_count: 0,
          gross_amount: 1750000,
          refund_amount: 0,
          net_amount: 1750000,
          unique_participants_count: 5,
          share_percentage: 100
        }
      ]
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (typeof url === 'string' && url.includes('/api/v1/admin/dashboard/summary')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockSummary })
        });
      }
      if (typeof url === 'string' && url.includes('/api/v1/admin/reports/activities/summary')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockActivityRecap })
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockTransactionsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      });
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jet Ski Special')).toBeInTheDocument();
    });

    const filterBtn = screen.getByRole('button', { name: /filter ledger/i });
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(screen.getByText(/sedang difilter/i)).toBeInTheDocument();
      expect(screen.getByText(/Wahana:/i)).toBeInTheDocument();
    });

    // Reset filter
    const removeFilterBtn = screen.getByTitle('Hapus filter wahana');
    fireEvent.click(removeFilterBtn);

    await waitFor(() => {
      expect(screen.queryByTitle('Hapus filter wahana')).not.toBeInTheDocument();
    });
  });
});
