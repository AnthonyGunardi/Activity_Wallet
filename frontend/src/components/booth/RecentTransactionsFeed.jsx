import { ArrowDownRight, History } from 'lucide-react';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';

/**
 * RecentTransactionsFeed Component
 * Displays real-time feed of recent deductions processed by the booth operator.
 *
 * @param {{
 *   transactions: Array<{
 *     id: string,
 *     amount: number,
 *     balance_after?: number,
 *     activity_name?: string|null,
 *     participant_name?: string|null,
 *     participant_qr?: string|null,
 *     notes?: string|null,
 *     created_at: string
 *   }>
 * }} props
 */
export function RecentTransactionsFeed({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div
        className="sport-card"
        style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: 'var(--color-text-muted)',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--color-border)'
        }}
      >
        <History size={28} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Belum ada transaksi di booth ini.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          Transaksi Booth Terbaru
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {transactions.length} Transaksi
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="sport-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ArrowDownRight size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                  {tx.participant_name || tx.participant_qr || 'Peserta'}
                  <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: '0.375rem' }}>
                    • {tx.activity_name || 'Aktivitas'}
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {formatTransactionDate(tx.created_at)}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-danger-primary)' }}>
                -{formatCurrency(tx.amount)}
              </div>
              {typeof tx.balance_after === 'number' && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Sisa: {formatCurrency(tx.balance_after)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
