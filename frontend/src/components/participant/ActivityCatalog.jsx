import { Waves, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * ActivityCatalog Component
 * Displays available water sport activities with real-time affordability status based on wallet balance.
 *
 * @param {{
 *   activities: Array<{
 *     id: string,
 *     name: string,
 *     price: number,
 *     description?: string|null,
 *     is_affordable: boolean
 *   }>,
 *   currentBalance: number
 * }} props
 */
export function ActivityCatalog({ activities = [], currentBalance = 0 }) {
  if (!activities || activities.length === 0) {
    return (
      <div
        className="sport-card"
        style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--color-text-muted)',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--color-border)'
        }}
      >
        <Waves size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
        <p style={{ margin: 0, fontSize: '0.9375rem' }}>Belum ada aktivitas yang tersedia.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          Katalog Wahana Air
        </h3>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {activities.length} Wahana
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.875rem'
        }}
      >
        {activities.map((act) => {
          const isAffordable = typeof act.is_affordable === 'boolean'
            ? act.is_affordable
            : (currentBalance >= act.price);

          return (
            <div
              key={act.id}
              className="sport-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: isAffordable ? 'var(--color-bg-surface)' : 'var(--color-bg-card-hover)',
                opacity: isAffordable ? 1 : 0.85,
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {act.name}
                  </h4>
                  <span
                    className={`badge ${isAffordable ? 'badge-success' : 'badge-amber'}`}
                    style={{
                      fontSize: '0.6875rem',
                      padding: '0.2rem 0.5rem',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {isAffordable ? (
                      <>
                        <CheckCircle2 size={12} /> Tersedia
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} /> Saldo Kurang
                      </>
                    )}
                  </span>
                </div>

                {act.description && (
                  <p
                    style={{
                      margin: '0.375rem 0 0.75rem 0',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.4
                    }}
                  >
                    {act.description}
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  Tarif / Orang
                </span>
                <span
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: isAffordable ? 'var(--color-primary-600)' : 'var(--color-text-dim)'
                  }}
                >
                  {formatCurrency(act.price)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
