import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OfflineBanner } from '../../src/components/common/OfflineBanner';

describe('OfflineBanner Component Tests', () => {
  it('should render nothing when online and never went offline', () => {
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should display offline warning alert when network disconnects', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Koneksi Terputus/i);
    expect(alert).toHaveTextContent(/Anda sedang offline/i);
  });

  it('should display reconnected banner when connection restores and allow manual dismissal', () => {
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    const statusBanner = screen.getByRole('status');
    expect(statusBanner).toBeInTheDocument();
    expect(statusBanner).toHaveTextContent(/Koneksi Pulih/i);

    const closeBtn = screen.getByLabelText(/Tutup notifikasi/i);
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should auto-dismiss reconnection banner after timer fires', () => {
    vi.useFakeTimers();
    render(<OfflineBanner />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
