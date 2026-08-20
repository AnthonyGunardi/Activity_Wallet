import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginView } from './pages/LoginView';
import { ParticipantView } from './pages/ParticipantView';
import { BoothView } from './pages/BoothView';
import { ParticipantManagerView } from './pages/admin/ParticipantManagerView';
import { ActivityManagerView } from './pages/admin/ActivityManagerView';
import { AdminDashboardView } from './pages/admin/AdminDashboardView';
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
        paddingTop: '2.5rem',
        paddingBottom: '3.5rem'
      }}
    >
      <div className="hero-section">
        <div
          className="badge badge-blue"
          style={{
            marginBottom: '1rem',
            padding: '0.375rem 0.875rem'
          }}
        >
          <Waves size={15} /> Event Sepa Island Water Sports
        </div>
        <h1 className="hero-title">
          Digital Activity Wallet
        </h1>
        <p className="hero-subtitle">
          Sistem manajemen saldo prepaid aktivitas air digital untuk kenyamanan dan kecepatan transaksi di pulau.
        </p>
      </div>

      <div className="portal-grid">
        <Link
          to="/participant"
          className="sport-card"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-500)',
              border: '1px solid var(--color-primary-200)'
            }}
          >
            <Wallet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.375rem', color: 'var(--color-text-main)' }}>Portal Peserta</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Cek sisa saldo, tampilkan QR gelang, dan lihat katalog wahana air yang tersedia.
            </p>
          </div>
          <span className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>Buka Dompet</span>
        </Link>

        <Link
          to="/booth"
          className="sport-card"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success-primary)',
              border: '1px solid #a7f3d0'
            }}
          >
            <QrCode size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.375rem', color: 'var(--color-text-main)' }}>Scanner Booth Staff</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Scan QR code peserta, verifikasi saldo, dan eksekusi pemotongan biaya aktivitas secara instan.
            </p>
          </div>
          <span className="btn btn-success" style={{ marginTop: 'auto', width: '100%' }}>Masuk Scanner</span>
        </Link>

        <Link
          to="/admin"
          className="sport-card"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-sport-orange-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-sport-orange)',
              border: '1px solid #fed7aa'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.375rem', color: 'var(--color-text-main)' }}>Dashboard Supervisor</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Monitoring real-time transaksi, manajemen peserta & wahana, reissue QR, dan audit refund.
            </p>
          </div>
          <span className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>Akses Admin</span>
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
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="/participant" element={<ParticipantView />} />
              <Route path="/participant/:qrCode" element={<ParticipantView />} />
              <Route
                path="/booth/*"
                element={
                  <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                    <BoothView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/participants"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ParticipantManagerView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/activities"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ActivityManagerView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboardView />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
