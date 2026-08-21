import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminNavTabs } from '../../src/components/admin/AdminNavTabs';

describe('AdminNavTabs Component Tests', () => {
  it('should render Ringkasan, Peserta & QR, and Daftar Aktivitas tabs', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminNavTabs />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /ringkasan/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /peserta & qr/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /daftar aktivitas/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /transaksi/i })).not.toBeInTheDocument();
  });
});
