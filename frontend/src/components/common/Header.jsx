import { Compass, LogOut, LogIn, User as UserIcon } from 'lucide-react';
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
              background: 'linear-gradient(135deg, var(--color-primary-500), #2563eb)',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow-primary)',
              flexShrink: 0
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-text-main)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              Sepa Island
            </div>
            <div className="header-brand-sub" style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Activity Wallet
            </div>
          </div>
        </Link>

        <nav className="header-nav">

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  background: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem'
                }}
              >
                <UserIcon size={14} color="var(--color-primary-500)" />
                <span className="user-badge-name" style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{user?.name || user?.username}</span>
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
                title="Logout"
                style={{
                  minHeight: '40px',
                  minWidth: '40px',
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
                fontSize: '0.875rem',
                flexShrink: 0
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
