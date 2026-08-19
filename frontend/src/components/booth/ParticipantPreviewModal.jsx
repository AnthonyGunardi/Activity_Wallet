import { X, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * ParticipantPreviewModal Component
 * Displays participant verification details, current balance, and activity selector.
 *
 * @param {{
 *   isOpen: boolean,
 *   participant: {
 *     name: string,
 *     qr_code: string,
 *     current_balance: number
 *   },
 *   activities: Array<{
 *     id: string,
 *     name: string,
 *     price: number,
 *     description?: string|null,
 *     is_affordable: boolean
 *   }>,
 *   onSelectActivity: (activity: Object) => void,
 *   onClose: () => void
 * }} props
 */
export function ParticipantPreviewModal({
  isOpen,
  participant,
  activities = [],
  onSelectActivity,
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
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header with high contrast */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg-card-blue)',
            color: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verifikasi Peserta
              </span>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
                {participant.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Tutup"
            style={{ color: '#ffffff', padding: '0.375rem' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Balance Snapshot Card */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--color-bg-main)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Sisa Saldo Saat Ini
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary-600)', letterSpacing: '-0.02em' }}>
                {formatCurrency(participant.current_balance)}
              </div>
            </div>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                fontWeight: 700,
                padding: '0.375rem 0.625rem',
                background: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-main)'
              }}
            >
              {participant.qr_code}
            </span>
          </div>
        </div>

        {/* Activity Selection List */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>
            Pilih Wahana / Aktivitas untuk Dipotong:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {activities.map((act) => {
              const isAffordable = typeof act.is_affordable === 'boolean'
                ? act.is_affordable
                : (participant.current_balance >= act.price);

              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    background: isAffordable ? 'var(--color-bg-surface)' : 'var(--color-bg-main)',
                    opacity: isAffordable ? 1 : 0.65
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
                      {act.name}
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: isAffordable ? 'var(--color-primary-600)' : 'var(--color-text-muted)' }}>
                      {formatCurrency(act.price)}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn ${isAffordable ? 'btn-primary' : 'btn-secondary'}`}
                    disabled={!isAffordable}
                    aria-label={`Pilih ${act.name}`}
                    onClick={() => onSelectActivity(act)}
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
                  >
                    {isAffordable ? 'Pilih' : 'Saldo Kurang'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', textAlign: 'right' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
