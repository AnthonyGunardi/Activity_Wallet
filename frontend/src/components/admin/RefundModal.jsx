import { useState, useEffect } from 'react';
import { X, RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';

/**
 * RefundModal Component
 * Confirmation dialog for processing authorized supervisor refunds.
 *
 * @param {{
 *   isOpen: boolean,
 *   transaction?: Object|null,
 *   isSubmitting: boolean,
 *   onConfirm: (transactionId: string, notes: string) => void,
 *   onClose: () => void
 * }} props
 */
export function RefundModal({ isOpen, transaction = null, isSubmitting, onConfirm, onClose }) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(transaction.id, notes.trim());
  };

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
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-danger-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RotateCcw size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Konfirmasi Otorisasi Refund
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

        {/* Transaction Overview Card */}
        <div
          style={{
            background: 'var(--color-bg-main)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Peserta:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
              {transaction.participant?.name} ({transaction.participant?.qr_code})
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Aktivitas:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
              {transaction.activity?.name || 'Aktivitas'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Waktu Transaksi:</span>
            <span style={{ color: 'var(--color-text-dim)' }}>
              {formatTransactionDate(transaction.created_at)}
            </span>
          </div>

          <div
            style={{
              borderTop: '1px dashed var(--color-border)',
              paddingTop: '0.5rem',
              marginTop: '0.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
              Nominal Dikembalikan:
            </span>
            <span style={{ fontWeight: 900, fontSize: '1.125rem', color: 'var(--color-success-primary)' }}>
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        {/* Warning Callout */}
        <div
          style={{
            display: 'flex',
            gap: '0.625rem',
            alignItems: 'flex-start',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-sport-orange-bg)',
            border: '1px solid #fed7aa',
            color: 'var(--color-sport-orange)',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem'
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Saldo sebesar <strong>{formatCurrency(transaction.amount)}</strong> akan langsung dikembalikan ke dompet
            peserta secara otomatis dan tercatat dalam audit log.
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="refundNotes" className="form-label" style={{ fontWeight: 600 }}>
              Alasan Refund (Audit Note)
            </label>
            <input
              id="refundNotes"
              type="text"
              className="form-input"
              placeholder="Contoh: Pembatalan transaksi / salah scan tiket"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              maxLength={255}
              style={{ fontSize: '0.875rem' }}
            />
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
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="loading-spin" /> Memproses...
                </>
              ) : (
                'Setujui & Refund'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
