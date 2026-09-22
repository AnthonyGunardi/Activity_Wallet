import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { OfflineBanner } from './components/common/OfflineBanner';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginView } from './pages/LoginView';
import { ParticipantView } from './pages/ParticipantView';
import { BoothView } from './pages/BoothView';
import { ParticipantManagerView } from './pages/admin/ParticipantManagerView';
import { ActivityManagerView } from './pages/admin/ActivityManagerView';
import { ActivitySummaryView } from './pages/admin/ActivitySummaryView';
import { AdminDashboardView } from './pages/admin/AdminDashboardView';
import {
  Wallet,
  QrCode,
  ShieldCheck,
  Waves,
  Zap,
  FileSpreadsheet,
  ArrowRight,
  Watch,
  ScanLine,
  BarChart3,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const HomeView = () => {
  return (
    <div
      className="app-container"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '2.5rem',
        paddingBottom: '3.5rem',
        gap: '2.5rem'
      }}
    >
      {/* Hero Section */}
      <section className="hero-layout">
        <div className="hero-content">
          <div className="hero-pill">
            <Waves size={15} /> EVENT SEPA ISLAND WATER SPORTS
          </div>
          <h1 className="hero-headline">
            Digital Activity Wallet
          </h1>
          <p className="hero-description">
            Kelola kredit aktivitas air dengan mudah, cepat, dan tercatat secara real-time.
          </p>

          <div className="hero-features">
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <Zap size={20} />
              </div>
              <div>
                <div className="hero-feature-title">Transaksi Cepat</div>
                <div className="hero-feature-desc">Scan QR & proses instan</div>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="hero-feature-title">Saldo Terpantau</div>
                <div className="hero-feature-desc">Cek saldo dan penggunaan secara real-time</div>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div className="hero-feature-title">Rekap Otomatis</div>
                <div className="hero-feature-desc">Semua transaksi tercatat dan siap diekspor</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual-wrapper">
          <img
            src="/assets/hero-mockup.png"
            alt="Sepa Island Activity Wallet Mobile & Water Sports"
            className="hero-visual-img"
            width="440"
            height="420"
            loading="eager"
            onError={(e) => {
              // Fallback to jpg if png is not found
              e.target.src = '/assets/hero-mockup.jpg';
            }}
          />
        </div>
      </section>

      {/* 3 Portal Action Cards */}
      <section className="portal-grid">
        <Link to="/participant" className="portal-card portal-card-participant">
          <div className="portal-card-header">
            <div className="portal-icon-box portal-icon-blue">
              <Wallet size={24} />
            </div>
            <span className="badge badge-blue">
              <span className="badge-dot badge-dot-blue"></span> Peserta
            </span>
          </div>
          <div>
            <h2 className="portal-card-title">
              Portal Peserta
            </h2>
            <p className="portal-card-desc">
              Cek saldo aktivitas, tampilkan QR peserta, dan lihat pilihan aktivitas air yang tersedia.
            </p>
            <div className="portal-tag-list">
              <span className="portal-tag">Saldo Aktivitas</span>
              <span className="portal-tag">QR Peserta</span>
              <span className="portal-tag">Daftar Aktivitas</span>
            </div>
          </div>
          <span className="portal-btn portal-btn-primary">
            Buka Dompet <ArrowRight size={18} className="portal-btn-arrow" />
          </span>
        </Link>

        <Link to="/booth" className="portal-card portal-card-staff">
          <div className="portal-card-header">
            <div className="portal-icon-box portal-icon-green">
              <QrCode size={24} />
            </div>
            <span className="badge badge-success">
              <span className="badge-dot badge-dot-green"></span> Activity Staff
            </span>
          </div>
          <div>
            <h2 className="portal-card-title">
              Scanner Aktivitas
            </h2>
            <p className="portal-card-desc">
              Scan QR peserta, cek saldo, lalu proses transaksi aktivitas dengan cepat.
            </p>
            <div className="portal-tag-list">
              <span className="portal-tag">Scan QR</span>
              <span className="portal-tag">Proses Transaksi</span>
              <span className="portal-tag">Riwayat Booth</span>
            </div>
          </div>
          <span className="portal-btn portal-btn-success">
            Buka Scanner <ArrowRight size={18} className="portal-btn-arrow" />
          </span>
        </Link>

        <Link to="/admin" className="portal-card portal-card-admin">
          <div className="portal-card-header">
            <div className="portal-icon-box portal-icon-amber">
              <ShieldCheck size={24} />
            </div>
            <span className="badge badge-warning">
              <span className="badge-dot badge-dot-amber"></span> Admin
            </span>
          </div>
          <div>
            <h2 className="portal-card-title">
              Dashboard Admin
            </h2>
            <p className="portal-card-desc">
              Pantau transaksi secara real-time, kelola peserta dan aktivitas, serta ekspor laporan.
            </p>
            <div className="portal-tag-list">
              <span className="portal-tag">Monitor Real-time</span>
              <span className="portal-tag">Riwayat Transaksi</span>
              <span className="portal-tag">Export Data</span>
            </div>
          </div>
          <span className="portal-btn portal-btn-neutral">
            Buka Dashboard <ArrowRight size={18} className="portal-btn-arrow" />
          </span>
        </Link>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-card">
        <div className="how-it-works-header">
          <div className="how-it-works-pill">
            <Sparkles size={14} /> ALUR TRANSAKSI
          </div>
          <h2 className="how-it-works-title">
            Bagaimana Sistem Ini Bekerja?
          </h2>
          <p className="how-it-works-subtitle">
            Alur transaksi aktivitas air yang praktis, cashless, dan tercatat secara real-time.
          </p>
        </div>

        <div className="how-it-works-steps">
          <div className="step-card">
            <div className="step-card-top">
              <div className="step-icon-container step-icon-1">
                <Watch size={28} />
              </div>
            </div>
            <div className="step-title">1. Check-in Peserta</div>
            <div className="step-desc">
              Peserta menerima nametag dengan QR peserta dan kredit aktivitas awal Rp1.000.000.
            </div>
          </div>

          <div className="step-connector" aria-hidden="true">
            <ChevronRight size={22} className="step-connector-arrow" />
          </div>

          <div className="step-card">
            <div className="step-card-top">
              <div className="step-icon-container step-icon-2">
                <ScanLine size={28} />
              </div>
            </div>
            <div className="step-title">2. Scan di Pos Aktivitas</div>
            <div className="step-desc">
              Staff memindai QR peserta, lalu biaya aktivitas otomatis dipotong dari saldo.
            </div>
          </div>

          <div className="step-connector" aria-hidden="true">
            <ChevronRight size={22} className="step-connector-arrow" />
          </div>

          <div className="step-card">
            <div className="step-card-top">
              <div className="step-icon-container step-icon-3">
                <Waves size={28} />
              </div>
            </div>
            <div className="step-title">3. Nikmati Aktivitas</div>
            <div className="step-desc">
              Transaksi selesai, peserta dapat langsung menikmati aktivitas air.
            </div>
          </div>

          <div className="step-connector" aria-hidden="true">
            <ChevronRight size={22} className="step-connector-arrow" />
          </div>

          <div className="step-card">
            <div className="step-card-top">
              <div className="step-icon-container step-icon-4">
                <BarChart3 size={28} />
              </div>
            </div>
            <div className="step-title">4. Transaksi Tercatat</div>
            <div className="step-desc">
              Seluruh transaksi tercatat secara real-time dan dapat dipantau melalui dashboard.
            </div>
          </div>
        </div>
      </section>
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
        <OfflineBanner />
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
                path="/admin/activity-summary"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ActivitySummaryView />
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
                element={<Navigate to="/admin" replace />}
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
