import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ParticipantManagerView } from '../../src/pages/admin/ParticipantManagerView';
import { ToastProvider } from '../../src/context/ToastContext';
import { AuthContext } from '../../src/context/authContextInstance';

describe('ParticipantManagerView Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockAdminUser = {
    id: 'admin-1',
    name: 'Admin Supervisor',
    role: 'ADMIN'
  };

  const mockParticipantsList = {
    participants: [
      {
        id: 'p-1',
        name: 'Budi Handoko',
        qr_code: 'SEPA-001',
        initial_credit: 1000000,
        current_balance: 750000,
        total_spent: 250000,
        status: 'ACTIVE'
      }
    ]
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ user: mockAdminUser, token: 'admin-token' }}>
        <ToastProvider>
          <MemoryRouter>
            <ParticipantManagerView />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };

  it('should render page header, search bar, and participant table', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockParticipantsList,
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
      })
    });

    renderComponent();

    expect(screen.getByText('Manajemen Peserta & QR')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
      expect(screen.getByText('SEPA-001')).toBeInTheDocument();
    });
  });

  it('should open single participant modal and create new participant', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockParticipantsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { id: 'p-2', name: 'Citra Kirana', qr_code: 'SEPA-002', current_balance: 1000000 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            participants: [
              ...mockParticipantsList.participants,
              { id: 'p-2', name: 'Citra Kirana', qr_code: 'SEPA-002', current_balance: 1000000, total_spent: 0, status: 'ACTIVE' }
            ]
          },
          meta: { total: 2, page: 1, limit: 20, totalPages: 1 }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /tambah peserta/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Tambah Peserta Baru')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nama lengkap peserta/i), {
      target: { value: 'Citra Kirana' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan peserta/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Citra Kirana')).toBeInTheDocument();
    });
  });

  it('should open edit modal and update participant', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockParticipantsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { id: 'p-1', name: 'Budi Handoko Updated', qr_code: 'SEPA-001', current_balance: 750000 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            participants: [
              { id: 'p-1', name: 'Budi Handoko Updated', qr_code: 'SEPA-001', current_balance: 750000, total_spent: 250000, status: 'ACTIVE' }
            ]
          },
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', { name: /edit budi handoko/i });
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Data Peserta')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nama lengkap peserta/i), {
      target: { value: 'Budi Handoko Updated' }
    });

    const saveBtn = screen.getByRole('button', { name: /simpan perubahan/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Budi Handoko Updated')).toBeInTheDocument();
    });
  });

  it('should open delete confirm modal and handle deletion', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockParticipantsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { deleted: true, id: 'p-1' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { participants: [] },
          meta: { total: 0, page: 1, limit: 20, totalPages: 1 }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole('button', { name: /hapus budi handoko/i });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Hapus Peserta?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /hapus permanen/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/tidak ada data peserta ditemukan/i)).toBeInTheDocument();
    });
  });

  it('should open Excel bulk import modal and import multiple participants', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockParticipantsList,
          meta: { total: 1, page: 1, limit: 20, totalPages: 1 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { created_count: 2 }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            participants: [
              ...mockParticipantsList.participants,
              { id: 'p-2', name: 'Peserta Baru 1', qr_code: 'SEPA-002', current_balance: 1000000, total_spent: 0, status: 'ACTIVE' },
              { id: 'p-3', name: 'Peserta Baru 2', qr_code: 'SEPA-003', current_balance: 1000000, total_spent: 0, status: 'ACTIVE' }
            ]
          },
          meta: { total: 3, page: 1, limit: 20, totalPages: 1 }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Budi Handoko')).toBeInTheDocument();
    });

    const bulkBtn = screen.getByRole('button', { name: /impor data peserta \(excel\)/i });
    expect(bulkBtn).toBeInTheDocument();
    fireEvent.click(bulkBtn);

    expect(screen.getByText('Impor Data Peserta (Excel / .xlsx)')).toBeInTheDocument();
  });
});

