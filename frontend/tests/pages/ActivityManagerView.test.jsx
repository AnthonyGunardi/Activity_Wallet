import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ActivityManagerView } from '../../src/pages/admin/ActivityManagerView';
import { ToastProvider } from '../../src/context/ToastContext';
import { AuthContext } from '../../src/context/authContextInstance';

describe('ActivityManagerView Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockAdminUser = {
    id: 'admin-1',
    name: 'Admin Supervisor',
    role: 'ADMIN'
  };

  const mockActivitiesList = {
    activities: [
      {
        id: 'act-1',
        name: 'Jet Ski',
        price: 350000,
        description: 'Water sports jet ski',
        status: 'ACTIVE'
      }
    ]
  };

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ user: mockAdminUser, token: 'admin-token' }}>
        <ToastProvider>
          <MemoryRouter initialEntries={['/admin/activities']}>
            <ActivityManagerView />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    );
  };

  it('should render page header, tabs, and activity table', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: mockActivitiesList
      })
    });

    renderComponent();

    expect(screen.getByText('Katalog Aktivitas')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Jet Ski')).toBeInTheDocument();
      expect(screen.getByText('Rp 350.000')).toBeInTheDocument();
    });
  });

  it('should open modal and create new activity', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockActivitiesList
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: { id: 'act-2', name: 'Banana Boat', price: 150000, status: 'ACTIVE' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            activities: [
              ...mockActivitiesList.activities,
              { id: 'act-2', name: 'Banana Boat', price: 150000, status: 'ACTIVE' }
            ]
          }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /tambah aktivitas/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Tambah Aktivitas Baru')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/nama aktivitas/i), {
      target: { value: 'Banana Boat' }
    });
    fireEvent.change(screen.getByLabelText(/harga per tiket/i), {
      target: { value: '150000' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan aktivitas/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Banana Boat')).toBeInTheDocument();
    });
  });

  it('should open modal in edit mode and update activity price', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockActivitiesList
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { id: 'act-1', name: 'Jet Ski', price: 380000, status: 'ACTIVE' }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            activities: [
              { id: 'act-1', name: 'Jet Ski', price: 380000, status: 'ACTIVE' }
            ]
          }
        })
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Jet Ski')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', { name: /edit jet ski/i });
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Aktivitas')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/harga per tiket/i), {
      target: { value: '380000' }
    });

    const submitBtn = screen.getByRole('button', { name: /simpan perubahan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Rp 380.000')).toBeInTheDocument();
    });
  });
});
