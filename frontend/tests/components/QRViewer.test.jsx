import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QRViewer } from '../../src/components/participant/QRViewer';

describe('QRViewer Component Tests', () => {
  it('should render scannable QR code card with token text', () => {
    render(<QRViewer qrCode="SEPA-001" participantName="Budi Santoso" />);

    expect(screen.getByText('SEPA-001')).toBeInTheDocument();
    expect(screen.getByText('Tunjukkan QR ini ke staff booth aktivitas')).toBeInTheDocument();
  });

  it('should toggle full-screen zoom modal on click', () => {
    render(<QRViewer qrCode="SEPA-001" participantName="Budi Santoso" />);

    const expandBtn = screen.getByRole('button', { name: /perbesar qr/i });
    fireEvent.click(expandBtn);

    expect(screen.getByText('Tampilan Penuh QR')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /tutup/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Tampilan Penuh QR')).not.toBeInTheDocument();
  });
});
