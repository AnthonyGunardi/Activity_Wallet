import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BulkImportModal } from '../../src/components/admin/BulkImportModal';

describe('BulkImportModal Component Tests', () => {
  it('should render CSV import instructions and textarea', () => {
    render(
      <BulkImportModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Import Peserta (Batch / CSV)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/masukkan daftar nama peserta/i)).toBeInTheDocument();
  });

  it('should parse newline/comma separated lines and trigger onSubmit', () => {
    const handleSubmit = vi.fn();
    render(
      <BulkImportModal
        isOpen={true}
        isSubmitting={false}
        onSubmit={handleSubmit}
        onClose={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/masukkan daftar nama peserta/i);
    fireEvent.change(textarea, {
      target: { value: 'Peserta Satu\nPeserta Dua, 1000000' }
    });

    const submitBtn = screen.getByRole('button', { name: /import 2 peserta/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith([
      { name: 'Peserta Satu', initial_credit: 1000000 },
      { name: 'Peserta Dua', initial_credit: 1000000 }
    ]);
  });
});
