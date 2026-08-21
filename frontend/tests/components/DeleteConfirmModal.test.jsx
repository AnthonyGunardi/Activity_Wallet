import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmModal } from '../../src/components/admin/DeleteConfirmModal';

describe('DeleteConfirmModal Component Tests', () => {
  const mockParticipant = {
    id: 'p-1',
    name: 'Budi Handoko',
    qr_code: 'SEPA-001'
  };

  it('should render confirmation text and participant info', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        participant={mockParticipant}
        isSubmitting={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Hapus Peserta?')).toBeInTheDocument();
    expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    expect(screen.getByText('Hapus Permanen')).toBeInTheDocument();
  });

  it('should trigger onConfirm when clicking Hapus Permanen', () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        participant={mockParticipant}
        isSubmitting={false}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /hapus permanen/i });
    fireEvent.click(deleteBtn);

    expect(handleConfirm).toHaveBeenCalledWith('p-1');
  });

  it('should trigger onClose when clicking Batal', () => {
    const handleClose = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        participant={mockParticipant}
        isSubmitting={false}
        onConfirm={vi.fn()}
        onClose={handleClose}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /batal/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
