import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ActivitySummaryView } from '../../src/pages/admin/ActivitySummaryView';
import { ToastProvider } from '../../src/context/ToastContext';
import * as downloadHelper from '../../src/utils/downloadHelper';

describe('ActivitySummaryView Page Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockSummaryData = {
    summary: {
      total_activities: 2,
      total_deductions: 10,
      total_refunds: 1,
      total_gross_amount: 6500000,
      total_refund_amount: 650000,
      total_net_amount: 5850000,
      total_unique_participants: 8
    },
    activities: [
      {
        id: 'act-1',
        name: 'Jetski Pro',
        price: 650000,
        status: 'ACTIVE',
        deduction_count: 8,
        refund_count: 1,
        gross_amount: 5200000,
        refund_amount: 650000,
        net_amount: 4550000,
        unique_participants_count: 7,
        share_percentage: 77.78
      },
      {
        id: 'act-2',
        name: 'Banana Boat Fun',
        price: 150000,
        status: 'INACTIVE',
        deduction_count: 2,
        refund_count: 0,
        gross_amount: 300000,
        refund_amount: 0,
        net_amount: 300000,
        unique_participants_count: 2,
        share_percentage: 22.22
      }
    ]
  };

  const mockTransactionsList = {
    transactions: [
      {
        id: 'tx-001',
        participant_id: 'p-1',
        activity_id: 'act-1',
        staff_id: 'staff-1',
        type: 'DEDUCTION',
        amount: 650000,
        balance_before: 1000000,
        balance_after: 350000,
        notes: 'Jetski session',
        created_at: '2026-08-20T10:00:00Z',
        participant: { id: 'p-1', name: 'Budi Santoso', qr_code: 'SEPA-001' },
        activity: { id: 'act-1', name: 'Jetski Pro', price: 650000 },
        staff: { id: 'staff-1', name: 'Booth Staff 1' },
        refund_transactions: []
      }
    ]
  };

  const setupMockFetch = () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/api/v1/admin/reports/activities/summary')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: mockSummaryData })
        });
      }
      if (urlStr.includes('/api/v1/admin/transactions')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: mockTransactionsList,
            meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} })
      });
    });
  };

  const renderComponent = () => {
    return render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/admin/activity-summary']}>
          <ActivitySummaryView />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders page header, KPI cards, activity recap cards, and detail transaction table', async () => {
    setupMockFetch();
    renderComponent();

    expect(screen.getByText('Rekapitulasi Transaksi per Wahana')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Jetski Pro' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Banana Boat Fun' })).toBeInTheDocument();
      expect(screen.getByText('Rp 5.850.000')).toBeInTheDocument();
      expect(screen.getByText('10 Kali')).toBeInTheDocument();
      expect(screen.getByText('8 Orang')).toBeInTheDocument();
      expect(screen.queryByText('Total Refund')).not.toBeInTheDocument();
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('-Rp 650.000')).toBeInTheDocument();
    });
  });

  it('selects a wahana card and filters detail transactions specifically for that wahana', async () => {
    setupMockFetch();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Jetski Pro' })).toBeInTheDocument();
    });

    const selectButtons = screen.getAllByRole('button', { name: /lihat detail transaksi/i });
    fireEvent.click(selectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Detail Transaksi: Jetski Pro/i)).toBeInTheDocument();
      expect(screen.getByText('Sedang Ditampilkan')).toBeInTheDocument();
    });

    // Reset filter
    const removeBtn = screen.getByTitle('Hapus filter wahana');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.getByText('Detail Transaksi: Semua Wahana')).toBeInTheDocument();
    });
  });

  it('filters detail transactions by participant search keyword', async () => {
    setupMockFetch();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari nama atau kode peserta/i);
    fireEvent.change(searchInput, { target: { value: 'Budi' } });

    await waitFor(() => {
      expect(searchInput.value).toBe('Budi');
    });
  });

  it('triggers CSV and Excel export downloads for activity recap summary', async () => {
    const downloadSpy = vi.spyOn(downloadHelper, 'downloadReport').mockResolvedValue();
    setupMockFetch();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Jetski Pro' })).toBeInTheDocument();
    });

    const csvBtn = screen.getByRole('button', { name: /ekspor rekap \(csv\)/i });
    fireEvent.click(csvBtn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('format=csv'),
        'activities-recap-report.csv'
      );
    });

    const excelBtn = screen.getByRole('button', { name: /ekspor rekap \(excel\)/i });
    fireEvent.click(excelBtn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('format=excel'),
        'activities-recap-report.xls'
      );
    });
  });

  it('triggers CSV and Excel export downloads for filtered transaction details', async () => {
    const downloadSpy = vi.spyOn(downloadHelper, 'downloadReport').mockResolvedValue();
    setupMockFetch();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    const txCsvBtn = screen.getByRole('button', { name: /ekspor transaksi \(csv\)/i });
    fireEvent.click(txCsvBtn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('format=csv'),
        expect.stringContaining('transactions-report.csv')
      );
    });

    const txExcelBtn = screen.getByRole('button', { name: /ekspor transaksi \(excel\)/i });
    fireEvent.click(txExcelBtn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('format=excel'),
        expect.stringContaining('transactions-report.xls')
      );
    });
  });
});
