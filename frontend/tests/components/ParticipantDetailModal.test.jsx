import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantDetailModal } from '../../src/components/admin/ParticipantDetailModal';

describe('ParticipantDetailModal Component Tests', () => {
  const mockDetailData = {
    id: 'p-1',
    name: 'Budi Handoko',
    qr_code: 'SEPA-001',
    initial_credit: 1000000,
    current_balance: 750000,
    total_spent: 250000,
    status: 'ACTIVE',
    transactions: [
      {
        id: 'tx-1',
        type: 'DEDUCTION',
        amount: 250000,
        balance_after: 750000,
        created_at: '2026-08-20T10:00:00Z',
        activity: { name: 'Jet Ski' }
      }
    ]
  };

  it('should fetch and render participant details and transaction history', async () => {
    const fetchDetailMock = vi.fn().mockResolvedValue({ data: mockDetailData });

    render(
      <ParticipantDetailModal
        isOpen={true}
        participantId="p-1"
        fetchDetail={fetchDetailMock}
        onClose={vi.fn()}
      />
    );

    expect(fetchDetailMock).toHaveBeenCalledWith('p-1');

    await waitFor(() => {
      expect(screen.getByText('Detail & Riwayat Peserta')).toBeInTheDocument();
      expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
      expect(screen.getByText('SEPA-001')).toBeInTheDocument();
      expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
      expect(screen.getByText('Jet Ski')).toBeInTheDocument();
      expect(screen.getByText('Debit')).toBeInTheDocument();
      expect(screen.getByText('-Rp 250.000')).toBeInTheDocument();
    });
  });

  it('should render TRANSFER_OUT and TRANSFER_IN with proper badges, notes, and signs', async () => {
    const transferDetailData = {
      id: 'p-2',
      name: 'Siti Rahma',
      qr_code: 'SEPA-002',
      initial_credit: 1000000,
      current_balance: 900000,
      total_spent: 0,
      status: 'ACTIVE',
      transactions: [
        {
          id: 'tx-transfer-out',
          type: 'TRANSFER_OUT',
          amount: 200000,
          balance_after: 800000,
          created_at: '2026-08-20T11:00:00Z',
          activity: null,
          notes: 'Transfer ke Budi (SEPA-001) - Patungan Jet Ski'
        },
        {
          id: 'tx-transfer-in',
          type: 'TRANSFER_IN',
          amount: 100000,
          balance_after: 900000,
          created_at: '2026-08-20T12:00:00Z',
          activity: null,
          notes: 'Transfer dari Doni (SEPA-003)'
        }
      ]
    };

    const fetchDetailMock = vi.fn().mockResolvedValue({ data: transferDetailData });

    render(
      <ParticipantDetailModal
        isOpen={true}
        participantId="p-2"
        fetchDetail={fetchDetailMock}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Transfer ke Budi (SEPA-001) - Patungan Jet Ski')).toBeInTheDocument();
      expect(screen.getByText('Transfer Keluar')).toBeInTheDocument();
      expect(screen.getByText('-Rp 200.000')).toBeInTheDocument();

      expect(screen.getByText('Transfer dari Doni (SEPA-003)')).toBeInTheDocument();
      expect(screen.getByText('Transfer Masuk')).toBeInTheDocument();
      expect(screen.getByText('+Rp 100.000')).toBeInTheDocument();
    });
  });

  it('should render empty state message when participant has no transactions', async () => {
    const emptyDetailData = {
      id: 'p-3',
      name: 'New Participant',
      qr_code: 'SEPA-003',
      initial_credit: 1000000,
      current_balance: 1000000,
      total_spent: 0,
      status: 'ACTIVE',
      transactions: []
    };

    const fetchDetailMock = vi.fn().mockResolvedValue(emptyDetailData);

    render(
      <ParticipantDetailModal
        isOpen={true}
        participantId="p-3"
        fetchDetail={fetchDetailMock}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Belum ada riwayat aktivitas transaksi.')).toBeInTheDocument();
    });
  });

  it('should render error alert when fetchDetail rejects', async () => {
    const fetchDetailMock = vi.fn().mockRejectedValue(new Error('Koneksi terputus'));

    render(
      <ParticipantDetailModal
        isOpen={true}
        participantId="p-1"
        fetchDetail={fetchDetailMock}
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Koneksi terputus')).toBeInTheDocument();
    });
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <ParticipantDetailModal
        isOpen={false}
        participantId="p-1"
        fetchDetail={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
