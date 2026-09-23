import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TransactionList } from '../../src/components/participant/TransactionList';

describe('TransactionList Component Tests', () => {
  const mockTransactions = [
    {
      id: 'tx-1',
      type: 'DEDUCTION',
      amount: 350000,
      balance_before: 1000000,
      balance_after: 650000,
      activity_name: 'Jet Ski',
      notes: null,
      created_at: '2026-08-19T10:00:00Z'
    },
    {
      id: 'tx-2',
      type: 'REFUND',
      amount: 150000,
      balance_before: 650000,
      balance_after: 800000,
      activity_name: null,
      notes: 'Pengembalian Donut Boat cuaca buruk',
      created_at: '2026-08-19T11:30:00Z'
    }
  ];

  it('should render list of transactions with correct type badges and amounts', () => {
    render(<TransactionList transactions={mockTransactions} />);

    expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    expect(screen.getByText('-Rp 350.000')).toBeInTheDocument();
    expect(screen.getByText('Debit')).toBeInTheDocument();

    expect(screen.getByText('Pengembalian Donut Boat cuaca buruk')).toBeInTheDocument();
    expect(screen.getByText('+Rp 150.000')).toBeInTheDocument();
    expect(screen.getByText('Refund')).toBeInTheDocument();
  });

  it('should render empty state when no transactions exist', () => {
    render(<TransactionList transactions={[]} />);
    expect(screen.getByText('Belum ada riwayat transaksi.')).toBeInTheDocument();
  });

  it('should render TRANSFER_OUT and TRANSFER_IN with distinct badges and formatting', () => {
    const transferTransactions = [
      {
        id: 'tx-out-1',
        type: 'TRANSFER_OUT',
        amount: 100000,
        balance_before: 500000,
        balance_after: 400000,
        activity_name: null,
        notes: 'Transfer saldo ke Budi (SEPA-002)',
        created_at: '2026-08-19T14:00:00Z'
      },
      {
        id: 'tx-in-1',
        type: 'TRANSFER_IN',
        amount: 75000,
        balance_before: 400000,
        balance_after: 475000,
        activity_name: null,
        notes: 'Transfer saldo dari Citra (SEPA-003)',
        created_at: '2026-08-19T14:30:00Z'
      }
    ];

    render(<TransactionList transactions={transferTransactions} />);

    expect(screen.getByText('Transfer saldo ke Budi (SEPA-002)')).toBeInTheDocument();
    expect(screen.getByText('Transfer Keluar')).toBeInTheDocument();
    expect(screen.getByText('-Rp 100.000')).toBeInTheDocument();

    expect(screen.getByText('Transfer saldo dari Citra (SEPA-003)')).toBeInTheDocument();
    expect(screen.getByText('Transfer Masuk')).toBeInTheDocument();
    expect(screen.getByText('+Rp 75.000')).toBeInTheDocument();
  });
});

