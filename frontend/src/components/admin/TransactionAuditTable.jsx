import { RotateCcw, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import { formatCurrency, formatTransactionDate } from '../../utils/formatters';

/**
 * TransactionAuditTable Component
 * Immutable audit ledger table for monitoring transactions and initiating refunds.
 *
 * @param {{
 *   transactions: Array<Object>,
 *   onRefundClick: (transaction: Object) => void
 * }} props
 */
export function TransactionAuditTable({ transactions = [], onRefundClick }) {
  if (!transactions || transactions.length === 0) {
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
        <FileText size={36} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Belum ada catatan transaksi.</h4>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
          Transaksi akan tercatat otomatis di sini.
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
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Waktu Transaksi</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Peserta</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Aktivitas / Tipe</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Nominal (IDR)</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Perubahan Saldo</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>Petugas Booth</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 700, textAlign: 'right' }}>Aksi / Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isDeduction = tx.type === 'DEDUCTION';
              const isRefund = tx.type === 'REFUND';
              const isAlreadyRefunded = Boolean(tx.refund_transactions && tx.refund_transactions.length > 0);

              return (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background 0.15s ease',
                    background: isRefund ? 'rgba(16, 185, 129, 0.03)' : 'transparent'
                  }}
                >
                  {/* Timestamp & ID */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      {formatTransactionDate(tx.created_at || tx.createdAt)}
                    </div>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'monospace',
                        color: 'var(--color-text-dim)',
                        marginTop: '0.125rem'
                      }}
                    >
                      {tx.id.substring(0, 8)}...
                    </div>
                  </td>

                  {/* Participant Name & QR */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.875rem' }}>
                      {tx.participant?.name || 'Peserta'}
                    </div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'var(--color-primary-600)',
                        fontWeight: 600
                      }}
                    >
                      {tx.participant?.qr_code || '-'}
                    </div>
                  </td>

                  {/* Activity & Type */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.875rem' }}>
                      {tx.activity?.name || (isRefund ? 'Pengembalian Dana (Refund)' : 'Penyesuaian Saldo')}
                    </div>
                    <span
                      className={`badge ${isRefund ? 'badge-success' : isDeduction ? 'badge-blue' : 'badge-neutral'}`}
                      style={{ fontSize: '0.6875rem', padding: '0.15rem 0.4rem', marginTop: '0.25rem' }}
                    >
                      {tx.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.9375rem',
                        color: isRefund ? 'var(--color-success-primary)' : 'var(--color-text-main)'
                      }}
                    >
                      {isRefund ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                    </span>
                  </td>

                  {/* Balance Before & After */}
                  <td style={{ padding: '1rem', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)' }}>
                      <span>{formatCurrency(tx.balance_before)}</span>
                      <ArrowRight size={12} />
                      <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
                        {formatCurrency(tx.balance_after)}
                      </span>
                    </div>
                  </td>

                  {/* Staff Member */}
                  <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    {tx.staff?.name || tx.staff?.username || 'Sistem'}
                  </td>

                  {/* Action or Status Badge */}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {isDeduction && !isAlreadyRefunded && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onRefundClick(tx)}
                        aria-label={`Refund transaksi ${tx.id}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 0.65rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          color: 'var(--color-danger-primary)'
                        }}
                      >
                        <RotateCcw size={14} /> Refund
                      </button>
                    )}

                    {isDeduction && isAlreadyRefunded && (
                      <span
                        className="badge badge-neutral"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <CheckCircle size={12} /> Sudah Direfund
                      </span>
                    )}

                    {isRefund && (
                      <span
                        className="badge badge-success"
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <CheckCircle size={12} /> Selesai
                      </span>
                    )}
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
