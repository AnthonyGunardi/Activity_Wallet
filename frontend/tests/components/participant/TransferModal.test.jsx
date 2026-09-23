import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransferModal } from '../../../src/components/participant/TransferModal';
import { participantApi } from '../../../src/api/participantApi';
import { ToastProvider } from '../../../src/context/ToastContext';

vi.mock('../../../src/api/participantApi', () => ({
  participantApi: {
    getTransferRecipient: vi.fn(),
    transferBalance: vi.fn()
  }
}));

describe('TransferModal Component Tests', () => {
  const mockSender = {
    id: 'sender-1',
    name: 'Andi Pratama',
    qr_code: 'SEPA-ANDI001',
    current_balance: 300000
  };

  const mockRecipient = {
    id: 'recipient-2',
    name: 'Budi Santoso',
    qr_code: 'SEPA-BUDI002',
    status: 'ACTIVE'
  };

  const defaultProps = {
    isOpen: true,
    sender: mockSender,
    onClose: vi.fn(),
    onTransferSuccess: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ToastProvider>
        <TransferModal {...defaultProps} {...props} />
      </ToastProvider>
    );
  };

  it('should not render anything when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('should render scanner and manual input field on step 1', () => {
    renderComponent();

    expect(screen.getByText('Transfer Saldo Aktivitas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contoh: SEPA-002')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cari penerima/i })).toBeInTheDocument();
  });

  it('should handle recipient search error (not found or self-transfer)', async () => {
    participantApi.getTransferRecipient.mockRejectedValueOnce({
      error: { code: 'SELF_TRANSFER_NOT_ALLOWED', message: 'Tidak dapat transfer ke akun sendiri.' }
    });

    renderComponent();

    const input = screen.getByPlaceholderText('Contoh: SEPA-002');
    const searchBtn = screen.getByRole('button', { name: /cari penerima/i });

    fireEvent.change(input, { target: { value: 'SEPA-ANDI001' } });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText(/tidak dapat transfer ke akun sendiri/i)).toBeInTheDocument();
    });
  });

  it('should advance to Step 2 when valid recipient is verified, allow quick chips, and validate balance', async () => {
    participantApi.getTransferRecipient.mockResolvedValueOnce({
      recipient: mockRecipient
    });

    renderComponent();

    const input = screen.getByPlaceholderText('Contoh: SEPA-002');
    const searchBtn = screen.getByRole('button', { name: /cari penerima/i });

    fireEvent.change(input, { target: { value: 'SEPA-BUDI002' } });
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('SEPA-BUDI002')).toBeInTheDocument();
    });

    // Test quick chip "Semua Saldo"
    const maxBtn = screen.getByRole('button', { name: /semua saldo/i });
    fireEvent.click(maxBtn);

    const amountInput = screen.getByLabelText(/nominal transfer/i);
    expect(amountInput.value).toBe('300000');

    // Test exceeding balance: enter 500.000 when balance is 300.000
    fireEvent.change(amountInput, { target: { value: '500000' } });
    expect(screen.getByText(/nominal melebihi sisa saldo/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /kirim saldo/i });
    expect(submitBtn).toBeDisabled();
  });

  it('should execute transfer successfully and trigger onTransferSuccess', async () => {
    participantApi.getTransferRecipient.mockResolvedValueOnce({
      recipient: mockRecipient
    });

    participantApi.transferBalance.mockResolvedValueOnce({
      transfer: {
        sender_balance: 150000,
        amount: 150000,
        recipient_name: 'Budi Santoso',
        transfer_out_id: 'tx-out-1',
        transfer_in_id: 'tx-in-2'
      }
    });

    const onTransferSuccess = vi.fn();
    renderComponent({ onTransferSuccess });

    const input = screen.getByPlaceholderText('Contoh: SEPA-002');
    fireEvent.change(input, { target: { value: 'SEPA-BUDI002' } });
    fireEvent.click(screen.getByRole('button', { name: /cari penerima/i }));

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    // Set nominal to 150000
    const amountInput = screen.getByLabelText(/nominal transfer/i);
    fireEvent.change(amountInput, { target: { value: '150000' } });

    const submitBtn = screen.getByRole('button', { name: /kirim saldo/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(participantApi.transferBalance).toHaveBeenCalledWith({
        sender_qr_code: mockSender.qr_code,
        recipient_qr_code: mockRecipient.qr_code,
        amount: 150000,
        notes: ''
      });
      expect(onTransferSuccess).toHaveBeenCalled();
      expect(screen.getByText(/transfer saldo berhasil/i)).toBeInTheDocument();
    });
  });
});
