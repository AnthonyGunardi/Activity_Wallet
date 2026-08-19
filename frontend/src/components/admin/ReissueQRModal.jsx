import { AlertTriangle, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../../utils/formatters';

/**
 * ReissueQRModal Component
 * Replaces lost/damaged wristband QR token while retaining exact balance and ledger records.
 *
 * @param {{
 *   isOpen: boolean,
 *   participant: Object|null,
 *   reissueResult: Object|null,
 *   isSubmitting: boolean,
 *   onConfirm: (participantId: string) => void,
 *   onClose: () => void
 * }} props
 */
export function ReissueQRModal({
  isOpen,
  participant,
  reissueResult,
  isSubmitting,
  onConfirm,
  onClose
}) {
  if (!isOpen || !participant) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="sport-card"
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '480px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: reissueResult ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                color: reissueResult ? 'var(--color-success-primary)' : 'var(--color-warning-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {reissueResult ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {reissueResult ? 'QR Berhasil Diperbarui' : 'Reissue / Ganti QR Gelang'}
            </h3>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Tutup"
            style={{ padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {reissueResult ? (
          <div>
            <div
              style={{
                background: 'var(--color-success-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid #a7f3d0',
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success-dark)', fontWeight: 600, textTransform: 'uppercase' }}>
                Kode QR Baru Peserta
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-success-dark)',
                  letterSpacing: '0.05em',
                  margin: '0.5rem 0'
                }}
              >
                {reissueResult.new_qr_code}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success-text)' }}>
                Kode QR lama ({reissueResult.previous_qr_code}) telah dinonaktifkan secara permanen.
              </div>
            </div>

            {/* Scannable New QR preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <QRCodeSVG value={reissueResult.new_qr_code} size={150} level="H" />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Selesai
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                background: 'var(--color-bg-main)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                border: '1px solid var(--color-border)',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Nama Peserta</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {participant.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>QR Token Saat Ini</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {participant.qr_code}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Sisa Saldo Wallet</span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                  {formatCurrency(participant.current_balance)}
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--color-warning-primary)',
                background: 'var(--color-warning-bg)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                lineHeight: 1.4
              }}
            >
              ⚠️ Reissue akan menghasilkan token baru dan menonaktifkan kode lama.
              Saldo sisa dan riwayat transaksi akan tetap utuh.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onConfirm(participant.id)}
                disabled={isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="loading-spin" /> Memproses...
                  </>
                ) : (
                  'Konfirmasi Reissue'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
