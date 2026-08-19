import { describe, it, expect, vi, beforeEach } from 'vitest';
import { boothApi } from '../../src/api/boothApi';

describe('boothApi Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('scanParticipant should call POST /api/v1/booth/scan with qr_code', async () => {
    const mockData = {
      participant: { id: 'p1', name: 'Citra', current_balance: 1000000 },
      eligible_activities: [{ id: 'a1', name: 'Jet Ski', price: 350000, is_affordable: true }]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockData })
    });

    const res = await boothApi.scanParticipant('SEPA-001');
    expect(res).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/booth/scan',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ qr_code: 'SEPA-001' })
      })
    );
  });

  it('createDeduction should call POST /api/v1/booth/transactions', async () => {
    const mockReceipt = {
      transaction: { id: 'tx-1', amount: 350000, balance_after: 650000 },
      updated_balance: 650000
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockReceipt })
    });

    const res = await boothApi.createDeduction({
      qr_code: 'SEPA-001',
      activity_id: 'act-1',
      notes: 'Test deduction'
    });

    expect(res).toEqual(mockReceipt);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/booth/transactions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          qr_code: 'SEPA-001',
          activity_id: 'act-1',
          notes: 'Test deduction'
        })
      })
    );
  });

  it('getRecentTransactions should call GET /api/v1/booth/transactions/recent', async () => {
    const mockList = { transactions: [{ id: 'tx-1', amount: 350000 }] };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockList })
    });

    const res = await boothApi.getRecentTransactions();
    expect(res).toEqual(mockList);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/booth/transactions/recent',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
