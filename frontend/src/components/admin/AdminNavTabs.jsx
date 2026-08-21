import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Waves } from 'lucide-react';

/**
 * AdminNavTabs Component
 * Sub-navigation tabs for switching between administrative modules.
 */
export function AdminNavTabs() {
  const location = useLocation();

  const isDashboardActive =
    location.pathname === '/admin' ||
    location.pathname === '/admin/' ||
    location.pathname.startsWith('/admin/dashboard');

  const isParticipantsActive = location.pathname.startsWith('/admin/participants');
  const isActivitiesActive = location.pathname.startsWith('/admin/activities');

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}
    >
      <Link
        to="/admin"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.125rem',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: isDashboardActive ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
          borderBottom: isDashboardActive ? '2px solid var(--color-primary-600)' : '2px solid transparent',
          marginBottom: '-1px',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease'
        }}
      >
        <LayoutDashboard size={16} /> Ringkasan
      </Link>

      <Link
        to="/admin/participants"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.125rem',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: isParticipantsActive ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
          borderBottom: isParticipantsActive ? '2px solid var(--color-primary-600)' : '2px solid transparent',
          marginBottom: '-1px',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease'
        }}
      >
        <Users size={16} /> Peserta & QR
      </Link>

      <Link
        to="/admin/activities"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.125rem',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: isActivitiesActive ? 'var(--color-primary-600)' : 'var(--color-text-muted)',
          borderBottom: isActivitiesActive ? '2px solid var(--color-primary-600)' : '2px solid transparent',
          marginBottom: '-1px',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease'
        }}
      >
        <Waves size={16} /> Daftar Aktivitas
      </Link>
    </div>
  );
}
