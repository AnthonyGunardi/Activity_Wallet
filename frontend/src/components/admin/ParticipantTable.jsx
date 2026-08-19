import { RefreshCw, Ban, CheckCircle2, QrCode } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * ParticipantTable Component
 * High-contrast responsive data table for event participant audit and wallet management.
 *
 * @param {{
 *   participants: Array<Object>,
 *   onReissue: (participant: Object) => void,
 *   onToggleStatus: (participant: Object, newStatus: string) => void
 * }} props
 */
export function ParticipantTable({ participants = [], onReissue, onToggleStatus }) {
  if (!participants || participants.length === 0) {
    return (
      <div
        className="sport-card"
        style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-muted)'
        }}
      >
        <QrCode size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Tidak ada data peserta ditemukan.</h4>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Coba ubah kata kunci pencarian atau tambah peserta baru.
        </p>
      </div>
    );
  }

  return (
    <div
      className="sport-card"
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'var(--color-bg-main)',
                borderBottom: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Nama Peserta</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Kode QR Token</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Sisa Saldo</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Total Terpakai</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700, textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const isBlocked = p.status === 'BLOCKED';

              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background 0.15s ease',
                    background: isBlocked ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-bg-main)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-main)'
                      }}
                    >
                      {p.qr_code}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                    {formatCurrency(p.current_balance)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {formatCurrency(p.total_spent)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      className={`badge ${isBlocked ? 'badge-danger' : 'badge-success'}`}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onReissue(p)}
                        aria-label={`Reissue QR ${p.name}`}
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <RefreshCw size={14} /> Reissue QR
                      </button>

                      {isBlocked ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => onToggleStatus(p, 'ACTIVE')}
                          aria-label={`Aktifkan ${p.name}`}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <CheckCircle2 size={14} /> Aktifkan
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => onToggleStatus(p, 'BLOCKED')}
                          aria-label={`Blokir ${p.name}`}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Ban size={14} /> Blokir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
