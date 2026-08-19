import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParticipantPreviewModal } from '../../src/components/booth/ParticipantPreviewModal';

describe('ParticipantPreviewModal Component Tests', () => {
  const mockParticipant = {
    name: 'Ahmad Fauzi',
    qr_code: 'SEPA-BOOTH-001',
    current_balance: 750000
  };

  const mockActivities = [
    { id: 'act-1', name: 'Jet Ski', price: 350000, is_affordable: true },
    { id: 'act-2', name: 'Flyboard Extreme', price: 900000, is_affordable: false }
  ];

  it('should render participant details, balance, and activities', () => {
    render(
      <ParticipantPreviewModal
        isOpen={true}
        participant={mockParticipant}
        activities={mockActivities}
        onSelectActivity={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Ahmad Fauzi')).toBeInTheDocument();
    expect(screen.getByText('SEPA-BOOTH-001')).toBeInTheDocument();
    expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
    expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    expect(screen.getByText('Flyboard Extreme')).toBeInTheDocument();
  });

  it('should trigger onSelectActivity when an affordable activity is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <ParticipantPreviewModal
        isOpen={true}
        participant={mockParticipant}
        activities={mockActivities}
        onSelectActivity={handleSelect}
        onClose={vi.fn()}
      />
    );

    const jetSkiBtn = screen.getByRole('button', { name: /pilih jet ski/i });
    fireEvent.click(jetSkiBtn);

    expect(handleSelect).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('should disable selection for unaffordable activities', () => {
    const handleSelect = vi.fn();
    render(
      <ParticipantPreviewModal
        isOpen={true}
        participant={mockParticipant}
        activities={mockActivities}
        onSelectActivity={handleSelect}
        onClose={vi.fn()}
      />
    );

    const flyboardBtn = screen.getByRole('button', { name: /pilih flyboard extreme/i });
    expect(flyboardBtn).toBeDisabled();
  });
});
