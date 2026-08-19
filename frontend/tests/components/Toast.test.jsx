import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider } from '../../src/context/ToastContext';
import { useToast } from '../../src/hooks/useToast';

const TestComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess('Transaksi Berhasil!')}>Success Toast</button>
      <button onClick={() => showError('Saldo Tidak Cukup!')}>Error Toast</button>
      <button onClick={() => showWarning('Peringatan Sinyal!')}>Warning Toast</button>
      <button onClick={() => showInfo('Informasi Event!')}>Info Toast</button>
    </div>
  );
};

describe('Toast Component & Context Tests', () => {
  it('should render success, error, warning, and info toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByText('Transaksi Berhasil!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Error Toast'));
    expect(screen.getByText('Saldo Tidak Cukup!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Warning Toast'));
    expect(screen.getByText('Peringatan Sinyal!')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Info Toast'));
    expect(screen.getByText('Informasi Event!')).toBeInTheDocument();
  });

  it('should dismiss toast on dismiss button click', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByText('Transaksi Berhasil!')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Tutup notifikasi');
    fireEvent.click(closeButton);
    expect(screen.queryByText('Transaksi Berhasil!')).not.toBeInTheDocument();
  });

  it('should throw error when useToast is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const BadComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<BadComponent />)).toThrow('useToast must be used within a ToastProvider');

    consoleErrorSpy.mockRestore();
  });

  it('should auto-dismiss toast after specified duration', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByText('Transaksi Berhasil!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4500);
    });

    expect(screen.queryByText('Transaksi Berhasil!')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
