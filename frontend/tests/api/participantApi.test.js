import { describe, it, expect, vi, beforeEach } from 'vitest';
import { participantApi } from '../../src/api/participantApi';

describe('participantApi Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch participant wallet data by QR code token', async () => {
    const mockWalletData = {
      participant: {
        id: 'p-1',
        name: 'Budi Santoso',
        qr_code: 'SEPA-001',
        initial_credit: 1000000,
        current_balance: 750000,
        total_spent: 250000,
        status: 'ACTIVE'
      },
      activities: [
        { id: 'act-1', name: 'Jet Ski', price: 350000, is_affordable: true }
      ],
      recent_transactions: [
        { id: 'tx-1', type: 'DEDUCTION', amount: 250000, activity_name: 'Donut Boat' }
      ]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockWalletData
      })
    });

    const result = await participantApi.getWallet('SEPA-001');
    expect(result).toEqual(mockWalletData);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/participants/wallet/SEPA-001',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });
});
