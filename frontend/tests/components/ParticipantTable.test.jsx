import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantTable } from '../../src/components/admin/ParticipantTable';

describe('ParticipantTable Component Tests', () => {
  const mockParticipants = [
    {
      id: 'p-1',
      name: 'Budi Handoko',
      qr_code: 'SEPA-001',
      initial_credit: 1000000,
      current_balance: 750000,
      total_spent: 250000,
      status: 'ACTIVE'
    },
    {
      id: 'p-2',
      name: 'Zulkifli Hasan',
      qr_code: 'SEPA-002',
      initial_credit: 1000000,
      current_balance: 500000,
      total_spent: 500000,
      status: 'BLOCKED'
    }
  ];

  it('should render table headers and participant rows with balances', () => {
    render(
      <ParticipantTable
        participants={mockParticipants}
        onReissue={vi.fn()}
        onToggleStatus={vi.fn()}
      />
    );

    expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    expect(screen.getByText('SEPA-001')).toBeInTheDocument();
    expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 250.000')).toBeInTheDocument();
    expect(screen.getByText('Zulkifli Hasan')).toBeInTheDocument();
  });

  it('should trigger onViewDetail when Detail button is clicked', () => {
    const handleDetail = vi.fn();
    render(
      <ParticipantTable
        participants={mockParticipants}
        onViewDetail={handleDetail}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReissue={vi.fn()}
        onToggleStatus={vi.fn()}
      />
    );

    const detailBtn = screen.getByRole('button', { name: /detail budi handoko/i });
    fireEvent.click(detailBtn);
    expect(handleDetail).toHaveBeenCalledWith(mockParticipants[0]);
  });

  it('should trigger onEdit when Edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(
      <ParticipantTable
        participants={mockParticipants}
        onViewDetail={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
        onReissue={vi.fn()}
        onToggleStatus={vi.fn()}
      />
    );

    const editBtn = screen.getByRole('button', { name: /edit budi handoko/i });
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(mockParticipants[0]);
  });

  it('should trigger onDelete when Delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <ParticipantTable
        participants={mockParticipants}
        onViewDetail={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
        onReissue={vi.fn()}
        onToggleStatus={vi.fn()}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /hapus budi handoko/i });
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(mockParticipants[0]);
  });

  it('should trigger onReissue when Reissue QR button is clicked', () => {
    const handleReissue = vi.fn();
    render(
      <ParticipantTable
        participants={mockParticipants}
        onReissue={handleReissue}
        onToggleStatus={vi.fn()}
      />
    );

    const reissueBtns = screen.getAllByRole('button', { name: /reissue qr/i });
    fireEvent.click(reissueBtns[0]);

    expect(handleReissue).toHaveBeenCalledWith(mockParticipants[0]);
  });

  it('should trigger onToggleStatus when Block/Unblock button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <ParticipantTable
        participants={mockParticipants}
        onReissue={vi.fn()}
        onToggleStatus={handleToggle}
      />
    );

    const blockBtn = screen.getByRole('button', { name: /blokir budi handoko/i });
    fireEvent.click(blockBtn);
    expect(handleToggle).toHaveBeenCalledWith(mockParticipants[0], 'BLOCKED');

    const unblockBtn = screen.getByRole('button', { name: /aktifkan zulkifli hasan/i });
    fireEvent.click(unblockBtn);
    expect(handleToggle).toHaveBeenCalledWith(mockParticipants[1], 'ACTIVE');
  });
});
