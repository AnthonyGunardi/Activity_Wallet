import { LogOut, LogIn, User as UserIcon, Palmtree } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="app-container header-inner">
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
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              flexShrink: 0
            }}
          >
            <Palmtree size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-text-main)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Sepa Island
            </div>
            <div className="header-brand-sub" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-500)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Activity Wallet
            </div>
          </div>
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem'
                }}
              >
                <UserIcon size={14} color="var(--color-primary-500)" />
                <span className="user-badge-name" style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {user?.name || user?.username || 'Event Supervisor (Sepa)'}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    background: user?.role === 'ADMIN' ? '#fef3c7' : '#ecfdf5',
                    color: user?.role === 'ADMIN' ? '#d97706' : '#059669',
                    border: `1px solid ${user?.role === 'ADMIN' ? '#fde68a' : '#a7f3d0'}`
                  }}
                >
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="btn btn-secondary"
                aria-label="Logout"
                title="Logout"
                style={{
                  minHeight: '36px',
                  minWidth: '36px',
                  padding: '0.45rem',
                  color: 'var(--color-danger-primary)',
                  borderRadius: 'var(--radius-md)'
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
                minHeight: '38px',
                padding: '0.45rem 0.875rem',
                fontSize: '0.875rem',
                flexShrink: 0,
                borderRadius: 'var(--radius-md)'
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
