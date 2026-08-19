import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecentTransactionsFeed } from '../../src/components/booth/RecentTransactionsFeed';

describe('RecentTransactionsFeed Component Tests', () => {
  const mockTransactions = [
    {
      id: 'tx-1',
      type: 'DEDUCTION',
      amount: 350000,
      balance_after: 650000,
      activity_name: 'Jet Ski',
      participant_name: 'Budi Santoso',
      participant_qr: 'SEPA-001',
      created_at: '2026-08-19T10:30:00Z'
    }
  ];

  it('should render recent booth transactions with participant name and formatted price', () => {
    render(<RecentTransactionsFeed transactions={mockTransactions} />);

    expect(screen.getByText('Transaksi Booth Terbaru')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText(/Jet Ski/i)).toBeInTheDocument();
    expect(screen.getByText(/-Rp 350\.000/i)).toBeInTheDocument();
  });

  it('should render empty state when no transactions exist', () => {
    render(<RecentTransactionsFeed transactions={[]} />);
    expect(screen.getByText('Belum ada transaksi di booth ini.')).toBeInTheDocument();
  });
});
