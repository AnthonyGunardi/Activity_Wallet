import { Receipt, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';

/**
 * TransactionList Component
 * Displays participant's chronological transaction ledger history.
 *
 * @param {{
 *   transactions: Array<{
 *     id: string,
 *     type: 'DEDUCTION' | 'REFUND' | 'ADJUSTMENT',
 *     amount: number,
 *     balance_before?: number,
 *     balance_after?: number,
 *     activity_name?: string|null,
 *     notes?: string|null,
 *     created_at: string
 *   }>
 * }} props
 */
export function TransactionList({ transactions = [] }) {
  if (!transactions || transactions.length === 0) {
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
        <History size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
        <p style={{ margin: 0, fontSize: '0.9375rem' }}>Belum ada riwayat transaksi.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--color-text-main)' }}>
          Riwayat Transaksi
        </h3>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {transactions.length} Catatan
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {transactions.map((tx) => {
          const isRefund = tx.type === 'REFUND';
          const isAdjustment = tx.type === 'ADJUSTMENT';
          const isTransferOut = tx.type === 'TRANSFER_OUT';
          const isTransferIn = tx.type === 'TRANSFER_IN';
          const isPositive = isRefund || isTransferIn;

          return (
            <div
              key={tx.id}
              className="sport-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-surface)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isPositive
                      ? 'var(--color-success-bg)'
                      : isAdjustment
                        ? 'var(--color-primary-50)'
                        : 'var(--color-danger-bg)',
                    color: isPositive
                      ? 'var(--color-success-primary)'
                      : isAdjustment
                        ? 'var(--color-primary-500)'
                        : 'var(--color-danger-primary)'
                  }}
                >
                  {isPositive ? (
                    <ArrowUpRight size={20} />
                  ) : isAdjustment ? (
                    <Receipt size={20} />
                  ) : (
                    <ArrowDownRight size={20} />
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
                      {tx.activity_name || tx.notes || 'Transaksi Aktivitas'}
                    </span>
                    <span
                      className={`badge ${
                        isPositive
                          ? 'badge-success'
                          : isAdjustment
                            ? 'badge-blue'
                            : 'badge-amber'
                      }`}
                      style={{ fontSize: '0.625rem', padding: '0.125rem 0.375rem' }}
                    >
                      {isRefund
                        ? 'Refund'
                        : isAdjustment
                          ? 'Penyesuaian'
                          : isTransferIn
                            ? 'Transfer Masuk'
                            : isTransferOut
                              ? 'Transfer Keluar'
                              : 'Debit'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                    {formatTransactionDate(tx.created_at)}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: isPositive ? 'var(--color-success-primary)' : 'var(--color-text-main)'
                  }}
                >
                  {isPositive ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                </div>
                {typeof tx.balance_after === 'number' && (
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                    Sisa: {formatCurrency(tx.balance_after)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
