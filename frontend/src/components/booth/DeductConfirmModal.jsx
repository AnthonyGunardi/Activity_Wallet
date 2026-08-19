import { useState } from 'react';
import { AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * DeductConfirmModal Component
 * Two-step confirmation preventing accidental double debit taps with single-action lock.
 *
 * @param {{
 *   isOpen: boolean,
 *   participant: {
 *     name: string,
 *     qr_code: string,
 *     current_balance: number
 *   },
 *   activity: {
 *     name: string,
 *     price: number
 *   },
 *   isSubmitting: boolean,
 *   onConfirm: (notes?: string) => void,
 *   onCancel: () => void
 * }} props
 */
export function DeductConfirmModal({
  isOpen,
  participant,
  activity,
  isSubmitting,
  onConfirm,
  onCancel
}) {
  const [notes, setNotes] = useState('');

  if (!isOpen || !participant || !activity) return null;

  const newBalance = participant.current_balance - activity.price;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(notes);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9995,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(6px)',
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
          maxWidth: '460px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-warning-bg)',
              color: 'var(--color-warning-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              border: '1px solid #fde68a'
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
            Konfirmasi Potong Saldo
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Pastikan detail peserta dan wahana air sudah sesuai.
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-bg-main)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            border: '1px solid var(--color-border)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Nama Peserta</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {participant.name}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Wahana</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {activity.name}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-danger-primary)' }}>
              Biaya / Potongan
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-danger-primary)' }}>
              {formatCurrency(activity.price)}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Sisa Saldo Baru</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-success-primary)' }}>
              {formatCurrency(newBalance)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="txNotes" className="form-label" style={{ fontSize: '0.75rem' }}>
              Catatan Khusus (Opsional)
            </label>
            <input
              id="txNotes"
              type="text"
              className="form-input"
              placeholder="Contoh: Paket rombongan, dll"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="loading-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Check size={18} /> Konfirmasi & Potong Saldo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
