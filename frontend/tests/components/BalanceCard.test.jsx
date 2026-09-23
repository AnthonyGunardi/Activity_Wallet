import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BalanceCard } from '../../src/components/participant/BalanceCard';

describe('BalanceCard Component Tests', () => {
  const mockParticipant = {
    name: 'Budi Santoso',
    qr_code: 'SEPA-001',
    initial_credit: 1000000,
    current_balance: 750000,
    total_spent: 250000,
    status: 'ACTIVE'
  };

  it('should render participant name and formatted balance values', () => {
    render(<BalanceCard participant={mockParticipant} />);

    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('SEPA-001')).toBeInTheDocument();
    expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 250.000')).toBeInTheDocument();
  });

  it('should render blocked badge if status is BLOCKED', () => {
    const blockedParticipant = { ...mockParticipant, status: 'BLOCKED' };
    render(<BalanceCard participant={blockedParticipant} />);

    expect(screen.getByText(/blocked/i)).toBeInTheDocument();
  });

  it('should render Transfer Saldo button when onOpenTransfer is provided and participant is ACTIVE', () => {
    const onOpenTransfer = vi.fn();
    render(<BalanceCard participant={mockParticipant} onOpenTransfer={onOpenTransfer} />);

    const transferBtn = screen.getByRole('button', { name: /transfer saldo/i });
    expect(transferBtn).toBeInTheDocument();

    transferBtn.click();
    expect(onOpenTransfer).toHaveBeenCalledTimes(1);
  });
});

