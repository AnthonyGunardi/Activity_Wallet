import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * DeleteConfirmModal Component
 * Confirmation dialog for deleting a participant with audit integrity safeguards.
 *
 * @param {{
 *   isOpen: boolean,
 *   participant: Object | null,
 *   isSubmitting: boolean,
 *   onConfirm: (participantId: string) => void,
 *   onClose: () => void
 * }} props
 */
export function DeleteConfirmModal({ isOpen, participant, isSubmitting, onConfirm, onClose }) {
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
          maxWidth: '440px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger-600, #ef4444)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <AlertTriangle size={24} />
          </div>

          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Hapus Peserta?
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            Apakah Anda yakin ingin menghapus data peserta <strong>{participant.name}</strong> ({participant.qr_code})?
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-bg-main)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            marginBottom: '1.5rem',
            lineHeight: 1.4
          }}
        >
          <strong>Catatan:</strong> Peserta hanya dapat dihapus jika belum pernah melakukan aktivitas/transaksi.
          Jika sudah memiliki riwayat, gunakan fitur <strong>Blokir</strong>.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
            className="btn btn-danger"
            onClick={() => onConfirm(participant.id)}
            disabled={isSubmitting}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="loading-spin" /> Menghapus...
              </>
            ) : (
              'Hapus Permanen'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
