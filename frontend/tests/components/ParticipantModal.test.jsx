import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantModal } from '../../src/components/admin/ParticipantModal';

describe('ParticipantModal Component Tests', () => {
  it('should render participant creation form fields', () => {
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

  it('should submit form data when valid', () => {
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
});
