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

    expect(screen.getByText('Manajemen Peserta & Gelang')).toBeInTheDocument();

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
});
