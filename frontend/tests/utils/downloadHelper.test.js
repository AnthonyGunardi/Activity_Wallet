import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadReport } from '../../src/utils/downloadHelper';

describe('downloadHelper Unit Tests', () => {
  let originalFetch;
  let createObjectURLMock;
  let revokeObjectURLMock;

  beforeEach(() => {
    originalFetch = global.fetch;
    createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should fetch and create a download link with parsed filename from header', async () => {
    const mockBlob = new Blob(['mock,data'], { type: 'text/csv' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (header) => (header === 'Content-Disposition' ? 'attachment; filename="custom-report.csv"' : null)
      },
      blob: vi.fn().mockResolvedValue(mockBlob)
    });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await downloadReport('/api/v1/admin/reports/test', 'default.csv');

    expect(global.fetch).toHaveBeenCalled();
    expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should throw structured error message when HTTP response fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({ error: { message: 'Akses ditolak.' } })
    });

    await expect(downloadReport('/api/v1/admin/reports/forbidden')).rejects.toThrow('Akses ditolak.');
  });
});
