import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportToolbar } from '../../src/components/admin/ExportToolbar';
import { ToastProvider } from '../../src/context/ToastContext';
import * as downloadHelper from '../../src/utils/downloadHelper';

describe('ExportToolbar Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (ui) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  it('should render all export buttons', () => {
    renderWithProviders(<ExportToolbar />);

    expect(screen.getByText(/Ekspor Data & Laporan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Peserta \(CSV\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Peserta \(Excel\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transaksi \(CSV\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transaksi \(Excel\)/i })).toBeInTheDocument();
  });

  it('should trigger participant CSV download and show success toast', async () => {
    const downloadSpy = vi.spyOn(downloadHelper, 'downloadReport').mockResolvedValueOnce();

    renderWithProviders(<ExportToolbar />);

    const btn = screen.getByRole('button', { name: /Peserta \(CSV\)/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        '/api/v1/admin/reports/participants/export?format=csv',
        'participants-report.csv'
      );
    });

    expect(await screen.findByText(/Laporan Peserta \(CSV\) berhasil diunduh/i)).toBeInTheDocument();
  });

  it('should trigger ledger Excel download and show success toast', async () => {
    const downloadSpy = vi.spyOn(downloadHelper, 'downloadReport').mockResolvedValueOnce();

    renderWithProviders(<ExportToolbar />);

    const btn = screen.getByRole('button', { name: /Transaksi \(Excel\)/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(downloadSpy).toHaveBeenCalledWith(
        '/api/v1/admin/reports/transactions/export?format=excel',
        'transactions-report.xls'
      );
    });

    expect(await screen.findByText(/Laporan Ledger \(EXCEL\) berhasil diunduh/i)).toBeInTheDocument();
  });

  it('should show error toast if download fails', async () => {
    vi.spyOn(downloadHelper, 'downloadReport').mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<ExportToolbar />);

    const btn = screen.getByRole('button', { name: /Transaksi \(CSV\)/i });
    fireEvent.click(btn);

    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });
});
