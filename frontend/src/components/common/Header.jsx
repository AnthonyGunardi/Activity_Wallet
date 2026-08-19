import { Compass, Wallet, QrCode, Shield, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: 'Dompet Peserta', path: '/participant', icon: <Wallet size={18} /> },
    { label: 'Scanner Booth', path: '/booth', icon: <QrCode size={18} /> },
    { label: 'Admin Dashboard', path: '/admin', icon: <Shield size={18} /> }
  ];

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div
        className="app-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem'
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow-primary)'
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#f8fafc', lineHeight: 1.2 }}>
              Sepa Island
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 600 }}>
              Activity Wallet
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="btn btn-secondary"
                style={{
                  minHeight: '40px',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.875rem',
                  background: isActive ? 'var(--color-primary-600)' : 'transparent',
                  borderColor: isActive ? 'var(--color-primary-500)' : 'var(--color-border)',
                  color: '#ffffff'
                }}
              >
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}

          <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 0.25rem' }} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  background: 'var(--color-bg-surface)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem'
                }}
              >
                <UserIcon size={14} color="var(--color-primary-500)" />
                <span style={{ fontWeight: 600 }}>{user?.name || user?.username}</span>
                <span
                  className={`badge ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-success'}`}
                  style={{ fontSize: '0.6875rem', padding: '0.1rem 0.4rem' }}
                >
                  {user?.role}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary"
                aria-label="Logout"
                style={{
                  minHeight: '40px',
                  padding: '0.5rem',
                  color: 'var(--color-danger-primary)'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                minHeight: '40px',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem'
              }}
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
