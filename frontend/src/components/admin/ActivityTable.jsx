import { Edit3, CheckCircle2, Ban, Waves } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * ActivityTable Component
 * High-contrast responsive data table for admin activity catalog and pricing management.
 *
 * @param {{
 *   activities: Array<Object>,
 *   onEdit: (activity: Object) => void,
 *   onToggleStatus: (activity: Object, newStatus: string) => void
 * }} props
 */
export function ActivityTable({ activities = [], onEdit, onToggleStatus }) {
  if (!activities || activities.length === 0) {
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
        <Waves size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Tidak ada data aktivitas ditemukan.</h4>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Silakan tambahkan aktivitas air baru ke dalam katalog.
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
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Nama Aktivitas</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Harga (IDR)</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Deskripsi</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700, textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => {
              const isInactive = act.status === 'INACTIVE';

              return (
                <tr
                  key={act.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background 0.15s ease',
                    background: isInactive ? 'rgba(241, 245, 249, 0.6)' : 'transparent',
                    opacity: isInactive ? 0.75 : 1
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Waves size={18} style={{ color: 'var(--color-primary-500)' }} />
                      <span>{act.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                    {formatCurrency(act.price)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {act.description || '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      className={`badge ${isInactive ? 'badge-neutral' : 'badge-success'}`}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      {isInactive ? 'INACTIVE' : 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onEdit(act)}
                        aria-label={`Edit ${act.name}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>

                      {isInactive ? (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => onToggleStatus(act, 'ACTIVE')}
                          aria-label={`Aktifkan ${act.name}`}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.65rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <CheckCircle2 size={14} /> Aktifkan
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => onToggleStatus(act, 'INACTIVE')}
                          aria-label={`Nonaktifkan ${act.name}`}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.35rem 0.65rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: 'var(--color-danger-primary)'
                          }}
                        >
                          <Ban size={14} /> Nonaktifkan
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
