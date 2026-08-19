import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Wallet, QrCode, ShieldCheck, Waves } from 'lucide-react';

const HomeView = () => {
  return (
    <div
      className="app-container"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 1rem'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(14, 165, 233, 0.15)',
            color: 'var(--color-primary-500)',
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '1rem',
            border: '1px solid rgba(14, 165, 233, 0.3)'
          }}
        >
          <Waves size={16} /> Event Sepa Island Water Sports
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Digital Activity Wallet
        </h1>
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '1.125rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          Sistem manajemen saldo prepaid aktivitas air digital untuk kenyamanan dan kecepatan transaksi di pulau.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link
          to="/participant"
          className="glass-card"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              background: 'rgba(14, 165, 233, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-500)'
            }}
          >
            <Wallet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Portal Peserta</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Cek sisa saldo, tampilkan QR gelang, dan lihat katalog wahana air yang tersedia.
            </p>
          </div>
          <span className="btn btn-primary" style={{ marginTop: 'auto' }}>Buka Dompet</span>
        </Link>

        <Link
          to="/booth"
          className="glass-card"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success-primary)'
            }}
          >
            <QrCode size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Scanner Booth Staff</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Scan QR code peserta, verifikasi saldo, dan eksekusi pemotongan biaya aktivitas secara instan.
            </p>
          </div>
          <span className="btn btn-success" style={{ marginTop: 'auto' }}>Masuk Scanner</span>
        </Link>

        <Link
          to="/admin"
          className="glass-card"
          style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              background: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-warning-primary)'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Dashboard Supervisor</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Monitoring real-time transaksi, manajemen peserta & wahana, reissue QR, dan audit refund.
            </p>
          </div>
          <span className="btn btn-secondary" style={{ marginTop: 'auto' }}>Akses Admin</span>
        </Link>
      </div>
    </div>
  );
};

export const PlaceholderView = ({ title }) => (
  <div className="app-container" style={{ padding: '2rem' }}>
    <h2>{title}</h2>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/participant/*" element={<PlaceholderView title="Participant View (Task 3.2)" />} />
            <Route path="/booth/*" element={<PlaceholderView title="Booth Scanner (Task 4.2)" />} />
            <Route path="/admin/*" element={<PlaceholderView title="Admin Dashboard (Task 5.2/7.2)" />} />
            <Route path="/login" element={<PlaceholderView title="Login View (Task 2.2)" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ToastProvider>
  );
}
