import { Wallet, ShieldAlert, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * BalanceCard Component
 * Displays participant identification, current credit balance, total spent, and starting credit.
 *
 * @param {{
 *   participant: {
 *     name: string,
 *     qr_code: string,
 *     initial_credit: number,
 *     current_balance: number,
 *     total_spent: number,
 *     status: string
 *   }
 * }} props
 */
export function BalanceCard({ participant }) {
  if (!participant) return null;

  const isBlocked = participant.status === 'BLOCKED';

  return (
    <div
      className="sport-card"
      style={{
        background: isBlocked ? 'var(--color-danger-bg)' : 'var(--color-bg-card-blue)',
        color: isBlocked ? 'var(--color-danger-text)' : '#ffffff',
        border: isBlocked ? '1px solid var(--color-danger-primary)' : 'none',
        padding: '1.75rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isBlocked ? 'var(--shadow-md)' : '0 10px 25px -5px rgba(29, 78, 216, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Island Wave Overlay */}
      <div
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          opacity: 0.12,
          pointerEvents: 'none'
        }}
      >
        <Wallet size={160} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              opacity: 0.85,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Sparkles size={14} /> Sepa Island Activity Wallet
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0 0', color: isBlocked ? 'var(--color-danger-text)' : '#ffffff' }}>
            {participant.name}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: isBlocked ? 'var(--color-danger-primary)' : 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {isBlocked ? (
              <>
                <ShieldAlert size={12} /> Blocked
              </>
            ) : (
              participant.qr_code
            )}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8125rem', opacity: 0.85, marginBottom: '0.25rem' }}>
          Saldo Aktivitas
        </div>
        <div
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: isBlocked ? 'var(--color-danger-primary)' : '#ffffff'
          }}
        >
          {formatCurrency(participant.current_balance)}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: isBlocked ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Kredit Awal</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
            {formatCurrency(participant.initial_credit)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Total Penggunaan</div>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
            {formatCurrency(participant.total_spent)}
          </div>
        </div>
      </div>
    </div>
  );
}
