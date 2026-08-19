import { useBoothScanner } from '../hooks/useBoothScanner';
import { ScannerView } from '../components/booth/ScannerView';
import { ParticipantPreviewModal } from '../components/booth/ParticipantPreviewModal';
import { DeductConfirmModal } from '../components/booth/DeductConfirmModal';
import { RecentTransactionsFeed } from '../components/booth/RecentTransactionsFeed';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function BoothView() {
  const {
    scanData,
    selectedActivity,
    setSelectedActivity,
    isScanning,
    isSubmitting,
    error,
    lastReceipt,
    recentTransactions,
    handleScan,
    handleConfirmDeduction,
    clearScan,
    dismissReceipt
  } = useBoothScanner();

  return (
    <div className="app-container" style={{ padding: '1.5rem 1rem 3rem 1rem', maxWidth: '1100px', margin: '0 auto', flex: 1 }}>
      {/* Error Alert Notification */}
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
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <AlertCircle size={22} style={{ color: 'var(--color-danger-primary)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>
              Kendala Operasi Scanner
            </h4>
            <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.875rem' }}>{error}</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={clearScan}
            style={{ fontSize: '0.8125rem', color: 'var(--color-danger-text)' }}
          >
            Tutup
          </button>
        </div>
      )}

      {/* Instant Success Receipt Banner */}
      {lastReceipt && (
        <div
          className="sport-card"
          style={{
            background: 'var(--color-success-bg)',
            border: '2px solid var(--color-success-primary)',
            color: 'var(--color-success-text)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-success-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-success-dark)' }}>
                  Transaksi Berhasil
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-success-text)' }}>
                  {lastReceipt.participant?.name} ({lastReceipt.participant?.qr_code})
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-success"
              onClick={dismissReceipt}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}
            >
              Scan Berikutnya <ArrowRight size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #a7f3d0'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Aktivitas</span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>
                {lastReceipt.transaction?.activity_name || 'Wahana Air'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Biaya</span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-danger-primary)' }}>
                -{formatCurrency(lastReceipt.transaction?.amount)}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Sisa Saldo</span>
              <strong style={{ fontSize: '1.125rem', color: 'var(--color-success-primary)' }}>
                {formatCurrency(lastReceipt.updated_balance)}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Scanner & Right Recent Feed */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}
      >
        <ScannerView onScan={handleScan} isScanning={isScanning} />
        <RecentTransactionsFeed transactions={recentTransactions} />
      </div>

      {/* Step 1: Participant Preview Modal */}
      {scanData && !selectedActivity && (
        <ParticipantPreviewModal
          isOpen={Boolean(scanData)}
          participant={scanData.participant}
          activities={scanData.eligible_activities}
          onSelectActivity={(act) => setSelectedActivity(act)}
          onClose={clearScan}
        />
      )}

      {/* Step 2: Confirmation Modal */}
      {scanData && selectedActivity && (
        <DeductConfirmModal
          isOpen={Boolean(selectedActivity)}
          participant={scanData.participant}
          activity={selectedActivity}
          isSubmitting={isSubmitting}
          onConfirm={(notes) => handleConfirmDeduction(notes)}
          onCancel={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}
