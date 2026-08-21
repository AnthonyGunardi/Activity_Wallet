import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RefundModal } from '../../src/components/admin/RefundModal';

describe('RefundModal Component Tests', () => {
  const mockTransaction = {
    id: 'tx-1000',
    amount: 350000,
    created_at: '2026-08-20T10:00:00Z',
    participant: { name: 'Raffi Ahmad', qr_code: 'SEPA-001' },
    activity: { name: 'Jet Ski' }
  };

  it('should not render anything when isOpen is false or transaction is null', () => {
    const { container } = render(
      <RefundModal isOpen={false} transaction={mockTransaction} isSubmitting={false} onConfirm={vi.fn()} onClose={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render transaction summary details and submit refund notes', () => {
    const onConfirm = vi.fn();
    render(
      <RefundModal
        isOpen={true}
        transaction={mockTransaction}
        isSubmitting={false}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Konfirmasi Otorisasi Refund')).toBeInTheDocument();
    expect(screen.getByText(/Raffi Ahmad/i)).toBeInTheDocument();
    expect(screen.getByText(/Jet Ski/i)).toBeInTheDocument();
    expect(screen.getAllByText('Rp 350.000').length).toBeGreaterThanOrEqual(1);

    fireEvent.change(screen.getByLabelText(/alasan refund/i), {
      target: { value: 'Salah input aktivitas oleh staff' }
    });

    const submitBtn = screen.getByRole('button', { name: /setujui & refund/i });
    fireEvent.click(submitBtn);

    expect(onConfirm).toHaveBeenCalledWith('tx-1000', 'Salah input aktivitas oleh staff');
  });
});
