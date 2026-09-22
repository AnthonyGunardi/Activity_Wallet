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

  const renderComponent = () => {
    return render(
      <ToastProvider>
        <MemoryRouter initialEntries={['/admin/activity-summary']}>
          <ActivitySummaryView />
        </MemoryRouter>
      </ToastProvider>
    );
  };

  it('renders page header, KPI cards, filter toolbar, and table with activities', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockSummaryData })
    });

    renderComponent();

    expect(screen.getByText('Rekapitulasi Transaksi per Wahana')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Jetski Pro')).toBeInTheDocument();
      expect(screen.getByText('Banana Boat Fun')).toBeInTheDocument();
      expect(screen.getByText('Rp 5.850.000')).toBeInTheDocument();
      expect(screen.getByText('10 Kali')).toBeInTheDocument();
      expect(screen.getByText('8 Orang')).toBeInTheDocument();
      expect(screen.getByText('1 Kali')).toBeInTheDocument();
      expect(screen.getByText('77.78%')).toBeInTheDocument();
    });
  });

  it('filters activities list by search keyword', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockSummaryData })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jetski Pro')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari nama aktivitas/i);
    fireEvent.change(searchInput, { target: { value: 'Banana' } });

    expect(screen.getByText('Banana Boat Fun')).toBeInTheDocument();
    expect(screen.queryByText('Jetski Pro')).not.toBeInTheDocument();
  });

  it('sorts activities when clicking column header', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockSummaryData })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jetski Pro')).toBeInTheDocument();
    });

    const sortNameHeader = screen.getByText(/Nama Aktivitas/i);
    // First click sorts ascending
    fireEvent.click(sortNameHeader);

    const rows = screen.getAllByRole('row');
    // Banana Boat Fun should be above Jetski Pro alphabetically
    expect(rows[1]).toHaveTextContent('Banana Boat Fun');
    expect(rows[2]).toHaveTextContent('Jetski Pro');
  });

  it('triggers CSV and Excel export downloads', async () => {
    const downloadSpy = vi.spyOn(downloadHelper, 'downloadReport').mockResolvedValue();

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockSummaryData })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jetski Pro')).toBeInTheDocument();
    });

    const csvBtn = screen.getByRole('button', { name: /ekspor csv/i });
    fireEvent.click(csvBtn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('format=csv'),
        'activities-recap-report.csv'
      );
    });

    const excelBtn = screen.getByRole('button', { name: /ekspor excel/i });
    fireEvent.click(excelBtn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        expect.stringContaining('format=excel'),
        'activities-recap-report.xls'
      );
    });
  });

  it('displays empty state when no activities match search', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockSummaryData })
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jetski Pro')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari nama aktivitas/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentWahana' } });

    expect(screen.getByText(/tidak ada aktivitas yang sesuai/i)).toBeInTheDocument();
  });
});
