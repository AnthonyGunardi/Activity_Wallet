import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReissueQRModal } from '../../src/components/admin/ReissueQRModal';

describe('ReissueQRModal Component Tests', () => {
  const mockParticipant = {
    id: 'p-1',
    name: 'Budi Handoko',
    qr_code: 'SEPA-OLD-001',
    current_balance: 750000
  };

  it('should render warning, participant details, and reissue action button', () => {
    render(
      <ReissueQRModal
        isOpen={true}
        participant={mockParticipant}
        reissueResult={null}
        isSubmitting={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Reissue / Ganti QR Gelang')).toBeInTheDocument();
    expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    expect(screen.getByText('SEPA-OLD-001')).toBeInTheDocument();
    expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
  });

  it('should render newly generated QR token when reissue is complete', () => {
    const mockResult = {
      previous_qr_code: 'SEPA-OLD-001',
      new_qr_code: 'SEPA-REISSUE-XYZ999',
      participant: {
        ...mockParticipant,
        qr_code: 'SEPA-REISSUE-XYZ999'
      }
    };

    render(
      <ReissueQRModal
        isOpen={true}
        participant={mockParticipant}
        reissueResult={mockResult}
        isSubmitting={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('QR Berhasil Diperbarui')).toBeInTheDocument();
    expect(screen.getByText('SEPA-REISSUE-XYZ999')).toBeInTheDocument();
  });
});
