import { useState } from 'react';
import { X, UserPlus, RefreshCw } from 'lucide-react';

/**
 * ParticipantModal Component
 * Dialog for creating a single participant.
 *
 * @param {{
 *   isOpen: boolean,
 *   isSubmitting: boolean,
 *   onSubmit: (payload: { name: string, initial_credit: number, qr_code?: string }) => void,
 *   onClose: () => void
 * }} props
 */
export function ParticipantModal({ isOpen, isSubmitting, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [initialCredit, setInitialCredit] = useState(1000000);
  const [customQr, setCustomQr] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      initial_credit: Number(initialCredit) || 1000000,
      qr_code: customQr.trim() ? customQr.trim().toUpperCase() : ''
    });
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Tambah Peserta Baru
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

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="participantName" className="form-label" style={{ fontWeight: 600 }}>
              Nama Lengkap Peserta *
            </label>
            <input
              id="participantName"
              type="text"
              className="form-input"
              placeholder="Contoh: Anthony Gunardi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              style={{ fontSize: '0.9375rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="initialCredit" className="form-label" style={{ fontWeight: 600 }}>
              Saldo Awal (IDR)
            </label>
            <input
              id="initialCredit"
              type="number"
              className="form-input"
              value={initialCredit}
              onChange={(e) => setInitialCredit(e.target.value)}
              min="0"
              step="50000"
              disabled={isSubmitting}
              style={{ fontSize: '0.9375rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="customQrCode" className="form-label" style={{ fontWeight: 600 }}>
              Kode Gelang Khusus (Opsional - Kosongkan untuk auto-generate)
            </label>
            <input
              id="customQrCode"
              type="text"
              className="form-input"
              placeholder="Contoh: SEPA-VIP-001"
              value={customQr}
              onChange={(e) => setCustomQr(e.target.value)}
              disabled={isSubmitting}
              style={{ fontSize: '0.9375rem', textTransform: 'uppercase' }}
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
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="loading-spin" /> Menyimpan...
                </>
              ) : (
                'Simpan Peserta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
