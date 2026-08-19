import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminApi } from '../../src/api/adminApi';

describe('adminApi Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getParticipants should call GET /api/v1/admin/participants with query params', async () => {
    const mockData = {
      participants: [{ id: 'p1', name: 'Budi Handoko', current_balance: 1000000 }]
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockData, meta: { total: 1, page: 1, totalPages: 1 } })
    });

    const res = await adminApi.getParticipants({ page: 1, limit: 20, search: 'Budi', status: 'ACTIVE' });
    expect(res.participants).toEqual(mockData.participants);
    expect(res.meta).toEqual({ total: 1, page: 1, totalPages: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/participants?page=1&limit=20&search=Budi&status=ACTIVE',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('createParticipant should call POST /api/v1/admin/participants', async () => {
    const newPart = { name: 'Citra Kirana', initial_credit: 1000000 };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { id: 'p-new', ...newPart } })
    });

    const res = await adminApi.createParticipant(newPart);
    expect(res).toEqual({ id: 'p-new', ...newPart });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/participants',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newPart)
      })
    );
  });

  it('bulkCreateParticipants should call POST /api/v1/admin/participants/bulk', async () => {
    const payload = { participants: [{ name: 'Part 1' }, { name: 'Part 2' }] };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { created_count: 2 } })
    });

    const res = await adminApi.bulkCreateParticipants(payload.participants);
    expect(res).toEqual({ created_count: 2 });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/participants/bulk',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
  });

  it('reissueQr should call PUT /api/v1/admin/participants/:id/reissue-qr', async () => {
    const mockRes = { previous_qr_code: 'SEPA-OLD', new_qr_code: 'SEPA-NEW' };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockRes })
    });

    const res = await adminApi.reissueQr('part-1');
    expect(res).toEqual(mockRes);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/participants/part-1/reissue-qr',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('updateStatus should call PUT /api/v1/admin/participants/:id/status', async () => {
    const mockRes = { id: 'part-1', status: 'BLOCKED' };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockRes })
    });

    const res = await adminApi.updateStatus('part-1', 'BLOCKED');
    expect(res).toEqual(mockRes);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/admin/participants/part-1/status',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'BLOCKED' })
      })
    );
  });
});
