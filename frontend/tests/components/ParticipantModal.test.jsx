import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantModal } from '../../src/components/admin/ParticipantModal';

describe('ParticipantModal Component Tests', () => {
  it('should render participant creation form fields in add mode', () => {
    render(
      <ParticipantModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Tambah Peserta Baru')).toBeInTheDocument();
    expect(screen.getByLabelText(/nama lengkap peserta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/saldo awal/i)).toBeInTheDocument();
  });

  it('should submit form data when creating participant', () => {
    const handleSubmit = vi.fn();
    render(
      <ParticipantModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={handleSubmit}
        onClose={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/nama lengkap peserta/i), {
      target: { value: 'Citra Kirana' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan peserta/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Citra Kirana',
      initial_credit: 1000000,
      qr_code: ''
    });
  });

  it('should render edit mode when participant prop is provided', () => {
    const handleSubmit = vi.fn();
    const mockParticipant = {
      id: 'p-1',
      name: 'Anthony Gunardi',
      qr_code: 'SEPA-VIP-001',
      current_balance: 750000,
      total_spent: 250000
    };

    render(
      <ParticipantModal
        isOpen={true}
        isSubmitting={false}
        participant={mockParticipant}
        onSubmit={handleSubmit}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Data Peserta')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Anthony Gunardi')).toBeInTheDocument();
    expect(screen.getByText('SEPA-VIP-001')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nama lengkap peserta/i), {
      target: { value: 'Anthony Gunardi Updated' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan perubahan/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Anthony Gunardi Updated'
    });
  });
});
