import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminNavTabs } from '../../src/components/admin/AdminNavTabs';

describe('AdminNavTabs Component Tests', () => {
  it('should render Ringkasan, Peserta & QR, Daftar Aktivitas, and Rekap Aktivitas tabs in order', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminNavTabs />
      </MemoryRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent.trim())).toEqual([
      'Ringkasan',
      'Peserta & QR',
      'Daftar Aktivitas',
      'Rekap Aktivitas'
    ]);
    expect(screen.queryByRole('link', { name: /transaksi/i })).not.toBeInTheDocument();
  });
});
