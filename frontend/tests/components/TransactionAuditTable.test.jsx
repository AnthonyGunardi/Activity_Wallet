import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionAuditTable } from '../../src/components/admin/TransactionAuditTable';

describe('TransactionAuditTable Component Tests', () => {
  const mockTransactions = [
    {
      id: 'tx-10000000-0000-0000-0000-000000000001',
      participant_id: 'p-1',
      activity_id: 'act-1',
      staff_id: 'staff-1',
      type: 'DEDUCTION',
      amount: 350000,
      balance_before: 1000000,
      balance_after: 650000,
      notes: 'Jet ski ride',
      created_at: '2026-08-20T10:00:00Z',
      participant: { id: 'p-1', name: 'Raffi Ahmad', qr_code: 'SEPA-001' },
      activity: { id: 'act-1', name: 'Jet Ski', price: 350000 },
      staff: { id: 'staff-1', name: 'Booth Staff 1' },
      refund_transactions: []
    },
    {
      id: 'tx-20000000-0000-0000-0000-000000000002',
      participant_id: 'p-2',
      activity_id: 'act-2',
      staff_id: 'admin-1',
      type: 'REFUND',
      amount: 150000,
      balance_before: 850000,
      balance_after: 1000000,
      notes: 'Refunded banana boat',
      created_at: '2026-08-20T10:15:00Z',
      participant: { id: 'p-2', name: 'Nagita Slavina', qr_code: 'SEPA-002' },
      activity: { id: 'act-2', name: 'Banana Boat', price: 150000 },
      staff: { id: 'admin-1', name: 'Admin Supervisor' },
      refund_transactions: []
    }
  ];

  it('should render empty state when transactions list is empty', () => {
    render(<TransactionAuditTable transactions={[]} onRefundClick={vi.fn()} />);
    expect(screen.getByText(/belum ada catatan transaksi/i)).toBeInTheDocument();
  });

  it('should render transaction list with participant, activity, amount, and badges', () => {
    render(<TransactionAuditTable transactions={mockTransactions} onRefundClick={vi.fn()} />);

    expect(screen.getByText('Raffi Ahmad')).toBeInTheDocument();
    expect(screen.getByText('SEPA-001')).toBeInTheDocument();
    expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    expect(screen.getByText('-Rp 350.000')).toBeInTheDocument();

    expect(screen.getByText('Nagita Slavina')).toBeInTheDocument();
    expect(screen.getByText('+Rp 150.000')).toBeInTheDocument();
  });

  it('should trigger onRefundClick when Refund button is clicked on eligible deduction', () => {
    const onRefundClick = vi.fn();
    render(<TransactionAuditTable transactions={mockTransactions} onRefundClick={onRefundClick} />);

    const refundBtn = screen.getByRole('button', { name: /refund transaksi tx-10000000/i });
    fireEvent.click(refundBtn);

    expect(onRefundClick).toHaveBeenCalledWith(mockTransactions[0]);
  });
});
