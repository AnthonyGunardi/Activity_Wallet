import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParticipantWallet } from '../hooks/useParticipantWallet';
import { BalanceCard } from '../components/participant/BalanceCard';
import { QRViewer } from '../components/participant/QRViewer';
import { ActivityCatalog } from '../components/participant/ActivityCatalog';
import { TransactionList } from '../components/participant/TransactionList';
import { Wallet, RefreshCw, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function ParticipantView() {
  const { qrCode: routeQrCode } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [inputToken, setInputToken] = useState('');
  const savedToken = localStorage.getItem('sepa_participant_token') || '';
  const effectiveInitialToken = routeQrCode || savedToken;

  const {
    wallet,
    qrCode,
    setQrCode,
    isLoading,
    error,
    refreshWallet
  } = useParticipantWallet(effectiveInitialToken);

  useEffect(() => {
    if (routeQrCode && routeQrCode !== qrCode) {
      setQrCode(routeQrCode);
    }
  }, [routeQrCode, qrCode, setQrCode]);

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (!inputToken.trim()) {
      toast.show('Silakan masukkan kode token QR gelang Anda.', 'error');
      return;
    }
    setQrCode(inputToken.trim());
    navigate(`/participant/${encodeURIComponent(inputToken.trim())}`);
  };

  const handleQuickSelect = (token) => {
    setInputToken(token);
    setQrCode(token);
    navigate(`/participant/${encodeURIComponent(token)}`);
  };

  const handleClearParticipant = () => {
    localStorage.removeItem('sepa_participant_token');
    setQrCode('');
    navigate('/participant');
  };

  const handleManualRefresh = async () => {
    try {
      await refreshWallet();
      toast.show('Saldo dan riwayat berhasil diperbarui.', 'success');
    } catch (_err) {
      toast.show('Gagal memperbarui saldo.', 'error');
    }
  };

  // State 1: No active token chosen yet -> Token Entry Screen
  if (!qrCode && !wallet && !isLoading) {
    return (
      <div className="app-container" style={{ padding: '2rem 1rem', maxWidth: '580px', margin: '0 auto', flex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-500)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid var(--color-primary-200)'
            }}
          >
            <Wallet size={30} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Buka Dompet Peserta
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginTop: '0.5rem' }}>
            Masukkan kode token yang tertera pada gelang QR atau gunakan demo token di bawah.
          </p>
        </div>

        <div className="sport-card" style={{ padding: '1.75rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleLookupSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="tokenInput" className="form-label" style={{ fontWeight: 600 }}>
                Kode QR Token Gelang
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="tokenInput"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: SEPA-001"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '1.125rem',
                    letterSpacing: '0.05em',
                    paddingLeft: '2.75rem'
                  }}
                  autoFocus
                />
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-dim)'
                  }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Periksa Saldo & Aktivitas
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ⚡ Coba Demo Token Peserta:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['SEPA-001', 'SEPA-002', 'SEPA-003', 'SEPA-004'].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => handleQuickSelect(token)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '1.5rem 1rem 3rem 1rem', maxWidth: '1000px', margin: '0 auto', flex: 1 }}>
      {/* Top Navigation & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          gap: '0.5rem'
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleClearParticipant}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.625rem', fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} /> Ganti Peserta
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleManualRefresh}
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
        >
          <RefreshCw size={15} className={isLoading ? 'loading-spin' : ''} />
          {isLoading ? 'Memperbarui...' : 'Refresh'}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="sport-card"
          style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-primary)',
            color: 'var(--color-danger-text)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <AlertCircle size={22} style={{ color: 'var(--color-danger-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
              Gagal Membuka Dompet
            </h4>
            <p style={{ margin: '0.25rem 0 0.75rem 0', fontSize: '0.875rem' }}>{error}</p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleClearParticipant}
              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
            >
              Masukkan Token Lain
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !wallet && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
          <RefreshCw size={36} className="loading-spin" style={{ color: 'var(--color-primary-500)', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Memuat informasi saldo & aktivitas...</p>
        </div>
      )}

      {/* Main Wallet Content */}
      {wallet && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Top Row: Balance Card & QR Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}
          >
            <BalanceCard participant={wallet.participant} />
            <QRViewer qrCode={wallet.participant.qr_code} participantName={wallet.participant.name} />
          </div>

          {/* Bottom Row: Activity Catalog & Recent Transactions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              alignItems: 'start'
            }}
          >
            <ActivityCatalog
              activities={wallet.activities}
              currentBalance={wallet.participant.current_balance}
            />
            <TransactionList transactions={wallet.recent_transactions} />
          </div>
        </div>
      )}
    </div>
  );
}
