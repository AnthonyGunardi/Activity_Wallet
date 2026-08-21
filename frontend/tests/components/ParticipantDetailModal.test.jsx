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
