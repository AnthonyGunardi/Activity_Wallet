import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, Compass } from 'lucide-react';

export const LoginView = () => {
  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Silakan masukkan username dan kata sandi.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const user = await login(username.trim(), password);
      showSuccess(`Selamat datang, ${user.name}!`);

      const destination = location.state?.from?.pathname || (user.role === 'ADMIN' ? '/admin' : '/booth');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login gagal. Periksa kembali username dan kata sandi Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div
      className="app-container"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div className="sport-card login-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-glow-primary)'
            }}
          >
            <Compass size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 800 }}>Login Petugas</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Masuk untuk mengakses Booth Scanner atau Dashboard Admin Sepa Island
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            style={{
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              border: '1px solid var(--color-danger-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1.5rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="username-input"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginBottom: '0.5rem'
              }}
            >
              Username
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '1rem',
                  color: 'var(--color-text-dim)',
                  pointerEvents: 'none'
                }}
              >
                <UserIcon size={18} />
              </div>
              <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cth: staff_jetski atau admin"
                disabled={isSubmitting}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password-input"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
                marginBottom: '0.5rem'
              }}
            >
              Kata Sandi
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '1rem',
                  color: 'var(--color-text-dim)',
                  pointerEvents: 'none'
                }}
              >
                <Lock size={18} />
              </div>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1.5rem' }}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk ke Sistem'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Demo Accounts Quick Pill Box */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginBottom: '0.75rem'
            }}
          >
            AKUN DEMO CEPAT (KLIK UNTUK MENGISI):
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillQuickDemo('admin', 'admin123')}
              className="badge badge-warning"
              style={{ cursor: 'pointer', padding: '0.375rem 0.75rem', minHeight: '36px' }}
            >
              <ShieldCheck size={14} /> Admin Supervisor
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('staff_jetski', 'staff123')}
              className="badge badge-success"
              style={{ cursor: 'pointer', padding: '0.375rem 0.75rem', minHeight: '36px' }}
            >
              Staff Jet Ski
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
