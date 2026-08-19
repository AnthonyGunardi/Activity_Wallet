import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeductConfirmModal } from '../../src/components/booth/DeductConfirmModal';

describe('DeductConfirmModal Component Tests', () => {
  const mockParticipant = {
    name: 'Ahmad Fauzi',
    qr_code: 'SEPA-BOOTH-001',
    current_balance: 750000
  };

  const mockActivity = {
    id: 'act-1',
    name: 'Jet Ski',
    price: 350000
  };

  it('should display participant name, activity price, and new balance calculation', () => {
    render(
      <DeductConfirmModal
        isOpen={true}
        participant={mockParticipant}
        activity={mockActivity}
        isSubmitting={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Konfirmasi Potong Saldo')).toBeInTheDocument();
    expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
    expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    expect(screen.getByText('Rp 350.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 400.000')).toBeInTheDocument(); // 750000 - 350000
  });

  it('should trigger onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <DeductConfirmModal
        isOpen={true}
        participant={mockParticipant}
        activity={mockActivity}
        isSubmitting={false}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi & potong saldo/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });
});
