import { useState, useEffect } from 'react';
import { X, User, QrCode, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

/**
 * ParticipantDetailModal Component
 * Comprehensive details dialog showing participant wallet metrics and ledger history.
 *
 * @param {{
 *   isOpen: boolean,
 *   participantId: string | null,
 *   fetchDetail: (id: string) => Promise<Object>,
 *   onClose: () => void
 * }} props
 */
export function ParticipantDetailModal({ isOpen, participantId, fetchDetail, onClose }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && participantId) {
      setIsLoading(true);
      setError(null);
      fetchDetail(participantId)
        .then((res) => {
          setData(res.data || res);
        })
        .catch((err) => {
          setError(err.message || 'Gagal memuat detail peserta.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setData(null);
    }
  }, [isOpen, participantId, fetchDetail]);

  if (!isOpen) return null;

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
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg-surface)'
          }}
        >
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
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Detail & Riwayat Peserta
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Informasi saldo dan riwayat transaksi.
              </p>
            </div>
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

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <RefreshCw size={32} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Memuat data peserta...</p>
            </div>
          ) : error ? (
            <div className="alert-banner alert-error" style={{ margin: '1rem 0' }}>
              {error}
            </div>
          ) : data ? (
            <div>
              {/* Profile Card */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-main)',
                  border: '1px solid var(--color-border)',
                  marginBottom: '1.25rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {data.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <QrCode size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                      {data.qr_code}
                    </span>
                  </div>
                </div>

                <div>
                  <span
                    className={`badge ${data.status === 'BLOCKED' ? 'badge-danger' : 'badge-success'}`}
                    style={{ fontSize: '0.8125rem', padding: '0.35rem 0.65rem' }}
                  >
                    {data.status}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '0.75rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Saldo Awal
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                    {formatCurrency(data.initial_credit)}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-primary-50, rgba(14, 165, 233, 0.08))',
                    border: '1px solid var(--color-primary-200, rgba(14, 165, 233, 0.2))'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-700)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Sisa Saldo
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-600)', marginTop: '0.25rem' }}>
                    {formatCurrency(data.current_balance)}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Terpakai
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    {formatCurrency(data.total_spent)}
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Feed */}
              <div>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Riwayat Transaksi ({data.transactions ? data.transactions.length : 0})
                </h4>

                {!data.transactions || data.transactions.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      background: 'var(--color-bg-main)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.875rem'
                    }}
                  >
                    Belum ada riwayat aktivitas transaksi.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      maxHeight: '260px',
                      overflowY: 'auto'
                    }}
                  >
                    {data.transactions.map((tx) => {
                      const isRefund = tx.type === 'REFUND';
                      const isAdjustment = tx.type === 'ADJUSTMENT';
                      const isTransferOut = tx.type === 'TRANSFER_OUT';
                      const isTransferIn = tx.type === 'TRANSFER_IN';
                      const isPositive = isRefund || isTransferIn;

                      return (
                        <div
                          key={tx.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-main)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: 'var(--radius-sm)',
                                background: isPositive
                                  ? 'rgba(34, 197, 94, 0.1)'
                                  : isTransferOut
                                    ? 'rgba(245, 158, 11, 0.1)'
                                    : isAdjustment
                                      ? 'rgba(14, 165, 233, 0.1)'
                                      : 'rgba(239, 68, 68, 0.1)',
                                color: isPositive
                                  ? 'var(--color-success-600, #16a34a)'
                                  : isTransferOut
                                    ? 'var(--color-warning-600, #d97706)'
                                    : isAdjustment
                                      ? 'var(--color-primary-600)'
                                      : 'var(--color-danger-600, #ef4444)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                                  {tx.activity ? tx.activity.name : (tx.notes || (isTransferOut ? 'Transfer Keluar' : isTransferIn ? 'Transfer Masuk' : tx.type))}
                                </span>
                                <span
                                  className={`badge ${
                                    isPositive
                                      ? 'badge-success'
                                      : isTransferOut
                                        ? 'badge-warning'
                                        : isAdjustment
                                          ? 'badge-blue'
                                          : 'badge-danger'
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
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {formatDateTime(tx.created_at)}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontWeight: 800,
                                fontSize: '0.875rem',
                                color: isPositive
                                  ? 'var(--color-success-600, #16a34a)'
                                  : isTransferOut
                                    ? 'var(--color-warning-700, #b45309)'
                                    : 'var(--color-danger-600, #dc2626)'
                              }}
                            >
                              {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Saldo: {formatCurrency(tx.balance_after)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-surface)',
            textAlign: 'right'
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
