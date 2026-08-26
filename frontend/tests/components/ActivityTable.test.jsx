import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivityTable } from '../../src/components/admin/ActivityTable';

describe('ActivityTable Component Tests', () => {
  const mockActivities = [
    {
      id: 'act-1',
      name: 'Jet Ski',
      price: 350000,
      description: 'Water sports jet ski',
      status: 'ACTIVE'
    },
    {
      id: 'act-2',
      name: 'Banana Boat',
      price: 150000,
      description: 'Group boat ride',
      status: 'INACTIVE'
    }
  ];

  it('should render empty state message when activities list is empty', () => {
    render(<ActivityTable activities={[]} onEdit={vi.fn()} onToggleStatus={vi.fn()} />);

    expect(screen.getByText(/tidak ada data aktivitas ditemukan/i)).toBeInTheDocument();
  });

  it('should render list of activities with formatted prices and status badges', () => {
    render(<ActivityTable activities={mockActivities} onEdit={vi.fn()} onToggleStatus={vi.fn()} />);

    expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    expect(screen.getByText('Rp 350.000')).toBeInTheDocument();
    expect(screen.getByText('Banana Boat')).toBeInTheDocument();
    expect(screen.getByText('Rp 150.000')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ActivityTable activities={mockActivities} onEdit={onEdit} onToggleStatus={vi.fn()} />);

    const editBtn = screen.getByRole('button', { name: /edit jet ski/i });
    fireEvent.click(editBtn);

    expect(onEdit).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('should call onToggleStatus when status toggle button is clicked', () => {
    const onToggleStatus = vi.fn();
    render(<ActivityTable activities={mockActivities} onEdit={vi.fn()} onToggleStatus={onToggleStatus} />);

    const deactivateBtn = screen.getByRole('button', { name: /nonaktifkan jet ski/i });
    fireEvent.click(deactivateBtn);
    expect(onToggleStatus).toHaveBeenCalledWith(mockActivities[0], 'INACTIVE');

    const activateBtn = screen.getByRole('button', { name: /aktifkan banana boat/i });
    fireEvent.click(activateBtn);
    expect(onToggleStatus).toHaveBeenCalledWith(mockActivities[1], 'ACTIVE');
  });

  it('should render activities sorted by id ascending', () => {
    const unsortedActivities = [
      { id: 3, name: 'Snorkeling', price: 200000, status: 'ACTIVE' },
      { id: 1, name: 'Banana Boat', price: 150000, status: 'ACTIVE' },
      { id: 2, name: 'Donut Boat', price: 175000, status: 'ACTIVE' }
    ];

    render(<ActivityTable activities={unsortedActivities} onEdit={vi.fn()} onToggleStatus={vi.fn()} />);

    const rows = screen.getAllByRole('row');
    // Header is row 0, rows 1-3 are data rows
    expect(rows[1]).toHaveTextContent('Banana Boat');
    expect(rows[2]).toHaveTextContent('Donut Boat');
    expect(rows[3]).toHaveTextContent('Snorkeling');
  });
});
