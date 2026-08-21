import { useState } from 'react';
import { useAdminLedger } from '../../hooks/useAdminLedger';
import { SummaryMetricCard } from '../../components/admin/SummaryMetricCard';
import { TransactionAuditTable } from '../../components/admin/TransactionAuditTable';
import { RefundModal } from '../../components/admin/RefundModal';
import { AdminNavTabs } from '../../components/admin/AdminNavTabs';
import { ExportToolbar } from '../../components/admin/ExportToolbar';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import {
  Wallet,
  TrendingDown,
  Coins,
  Users,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

/**
 * AdminDashboardView Page
 * Executive dashboard overview featuring real-time event credit KPIs,
 * financial totals, and live transaction audit ledger with refund actions.
 */
export function AdminDashboardView() {
  const {
    summary,
    isLoadingSummary,
    transactions,
    pagination,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    isLoadingTransactions,
    fetchSummary,
    fetchTransactions,
    handleRefund
  } = useAdminLedger();

  const toast = useToast();

  const [selectedTxForRefund, setSelectedTxForRefund] = useState(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const onConfirmRefund = async (txId, notes) => {
    setIsSubmittingRefund(true);
    try {
      await handleRefund(txId, notes);
      toast.showSuccess('Refund berhasil diproses dan saldo telah dikembalikan ke peserta.');
      setSelectedTxForRefund(null);
    } catch (err) {
      toast.showError(err.message || 'Gagal memproses refund.');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="app-container" style={{ padding: '2rem 1rem 3rem 1rem', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
      {/* Header section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-primary-600)' }}>
            <ShieldAlert size={24} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dashboard Admin
            </span>
          </div>
          <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Ringkasan Kredit & Transaksi
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Pantau saldo peserta, penggunaan aktivitas, dan transaksi secara real-time.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            fetchSummary();
            fetchTransactions(pagination.page);
          }}
          disabled={isLoadingSummary || isLoadingTransactions}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
        >
          <RefreshCw size={16} className={isLoadingSummary || isLoadingTransactions ? 'loading-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Navigation Tabs */}
      <AdminNavTabs />

      {/* KPI Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <SummaryMetricCard
          title="Total Kredit Peserta"
          value={isLoadingSummary ? '...' : formatCurrency(summary?.total_allocated_credit || 0)}
          subtitle={`${summary?.total_participants || 0} Peserta terdaftar`}
          icon={<Wallet size={20} />}
          color="var(--color-primary-600)"
          bgColor="var(--color-primary-50)"
        />

        <SummaryMetricCard
          title="Total Kredit Terpakai"
          value={isLoadingSummary ? '...' : formatCurrency(summary?.total_spent_credit || 0)}
          subtitle={`${summary?.total_deductions || 0} transaksi pemotongan`}
          icon={<TrendingDown size={20} />}
          color="var(--color-sport-orange)"
          bgColor="var(--color-sport-orange-bg)"
        />

        <SummaryMetricCard
          title="Total Saldo Tersisa"
          value={isLoadingSummary ? '...' : formatCurrency(summary?.remaining_balance || 0)}
          subtitle="Saldo aktif siap pakai"
          icon={<Coins size={20} />}
          color="var(--color-success-primary)"
          bgColor="var(--color-success-bg)"
        />

        <SummaryMetricCard
          title="Peserta & Aktivitas"
          value={isLoadingSummary ? '...' : `${summary?.active_participants || 0} / ${summary?.total_participants || 0}`}
          subtitle={`${summary?.active_activities || 0} Aktivitas aktif`}
          icon={<Users size={20} />}
          color="#8b5cf6"
          bgColor="rgba(139, 92, 246, 0.1)"
        />
      </div>

      {/* Export Reports Toolbar */}
      <ExportToolbar />

      {/* Audit Ledger Section */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
            Riwayat Transaksi
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0 0' }}>
            Seluruh transaksi penggunaan saldo tercatat otomatis untuk kebutuhan monitoring.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="sport-card"
        style={{
          background: 'var(--color-bg-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-dim)'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Cari nama atau kode peserta"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ fontSize: '0.875rem', width: '180px', padding: '0.5rem 0.75rem' }}
          >
            <option value="">Semua Jenis Transaksi</option>
            <option value="DEDUCTION">DEDUCTION (Pemotongan)</option>
            <option value="REFUND">REFUND (Pengembalian)</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      {isLoadingTransactions && transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <RefreshCw size={32} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Memuat riwayat transaksi...</p>
        </div>
      ) : (
        <TransactionAuditTable
          transactions={transactions}
          onRefundClick={(tx) => setSelectedTxForRefund(tx)}
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            padding: '0.5rem 0'
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Menampilkan halaman <strong>{pagination.page}</strong> dari{' '}
            <strong>{pagination.totalPages}</strong> ({pagination.total} mutasi transaksi)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pagination.page <= 1 || isLoadingTransactions}
              onClick={() => fetchTransactions(pagination.page - 1)}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pagination.page >= pagination.totalPages || isLoadingTransactions}
              onClick={() => fetchTransactions(pagination.page + 1)}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      <RefundModal
        isOpen={Boolean(selectedTxForRefund)}
        transaction={selectedTxForRefund}
        isSubmitting={isSubmittingRefund}
        onConfirm={onConfirmRefund}
        onClose={() => setSelectedTxForRefund(null)}
      />
    </div>
  );
}
