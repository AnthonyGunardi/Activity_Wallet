import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivityModal } from '../../src/components/admin/ActivityModal';

describe('ActivityModal Component Tests', () => {
  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <ActivityModal isOpen={false} isSubmitting={false} onSubmit={vi.fn()} onClose={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render create activity form with default inputs', () => {
    render(
      <ActivityModal isOpen={true} isSubmitting={false} onSubmit={vi.fn()} onClose={vi.fn()} />
    );

    expect(screen.getByText('Tambah Aktivitas Baru')).toBeInTheDocument();
    expect(screen.getByLabelText(/nama aktivitas \/ wahana/i)).toHaveValue('');
    expect(screen.getByLabelText(/harga per tiket/i)).toHaveValue(150000);
  });

  it('should submit form payload when valid data is entered', () => {
    const onSubmit = vi.fn();
    render(
      <ActivityModal isOpen={true} isSubmitting={false} onSubmit={onSubmit} onClose={vi.fn()} />
    );

    fireEvent.change(screen.getByLabelText(/nama aktivitas \/ wahana/i), {
      target: { value: 'Donut Boat' }
    });
    fireEvent.change(screen.getByLabelText(/harga per tiket/i), {
      target: { value: '175000' }
    });
    fireEvent.change(screen.getByLabelText(/deskripsi singkat/i), {
      target: { value: 'Wahana perahu donat' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan aktivitas/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Donut Boat',
      price: 175000,
      description: 'Wahana perahu donat',
      status: 'ACTIVE'
    });
  });

  it('should prefill data in edit mode and submit updated payload', () => {
    const onSubmit = vi.fn();
    const mockActivity = {
      id: 'act-1',
      name: 'Jet Ski',
      price: 350000,
      description: 'Water sports jet ski',
      status: 'ACTIVE'
    };

    render(
      <ActivityModal
        isOpen={true}
        activity={mockActivity}
        isSubmitting={false}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Aktivitas Wahana')).toBeInTheDocument();
    expect(screen.getByLabelText(/nama aktivitas \/ wahana/i)).toHaveValue('Jet Ski');
    expect(screen.getByLabelText(/harga per tiket/i)).toHaveValue(350000);

    fireEvent.change(screen.getByLabelText(/harga per tiket/i), {
      target: { value: '400000' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan perubahan/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jet Ski',
      price: 400000,
      description: 'Water sports jet ski',
      status: 'ACTIVE'
    });
  });
});
