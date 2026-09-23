import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdminActivitySummary } from '../../hooks/useAdminActivitySummary';
import { adminApi } from '../../api/adminApi';
import { AdminNavTabs } from '../../components/admin/AdminNavTabs';
import { SummaryMetricCard } from '../../components/admin/SummaryMetricCard';
import { ActivityRecapSection } from '../../components/admin/ActivityRecapSection';
import { TransactionAuditTable } from '../../components/admin/TransactionAuditTable';
import { RefundModal } from '../../components/admin/RefundModal';
import { TransactionTypeFilter } from '../../components/admin/TransactionTypeFilter';
import { useToast } from '../../hooks/useToast';
import { downloadReport } from '../../utils/downloadHelper';
import { formatCurrency } from '../../utils/formatters';
import {
  Waves,
  RefreshCw,
  Search,
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingUp,
  Users,
  Activity as ActivityIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

/**
 * ActivitySummaryView Page
 * Master-detail hub for water activity performance recap and transactional audit ledger.
 * Enables supervisors to inspect high-level activity financial KPIs and drill down into
 * granular participant transaction mutations with search, filtering, refunding, and exports.
 */
export function ActivitySummaryView() {
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [txType, setTxType] = useState('');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [isExportingRecap, setIsExportingRecap] = useState(null);
  const [isExportingTx, setIsExportingTx] = useState(null);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  const toast = useToast();

  const {
    summary,
    activities,
    isLoading: isLoadingSummary,
    refetch: refetchSummary
  } = useAdminActivitySummary();

  // Find currently selected activity details
  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return null;
    return activities.find((a) => a.id === selectedActivityId) || null;
  }, [activities, selectedActivityId]);

  // Fetch transactions for the selected activity
  const fetchTransactions = useCallback(async (targetPage = 1) => {
    setIsLoadingTx(true);
    try {
      const res = await adminApi.getTransactions({
        page: targetPage,
        limit: 20,
        activity_id: selectedActivityId || undefined,
        type: txType || undefined,
        search: txSearch.trim() || undefined
      });

      const rawTxList =
        res?.transactions ||
        res?.data?.transactions ||
        (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      setTransactions(rawTxList);
      if (res?.meta) {
        setPagination(res.meta.pagination || res.meta);
      }
    } catch (err) {
      toast.showError(err.message || 'Gagal memuat detail transaksi aktivitas.');
    } finally {
      setIsLoadingTx(false);
    }
  }, [selectedActivityId, txType, txSearch, toast]);

  useEffect(() => {
    fetchTransactions(1);
    setPage(1);
  }, [fetchTransactions]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchTransactions(newPage);
  };

  const handleRefreshAll = () => {
    refetchSummary();
    fetchTransactions(page);
  };

  // Export activity recap summary report
  const handleExportRecap = async (format) => {
    setIsExportingRecap(format);
    try {
      const endpoint = adminApi.getActivitiesExportUrl({ format });
      const ext = format === 'excel' ? 'xls' : 'csv';
      await downloadReport(endpoint, `activities-recap-report.${ext}`);
      toast.showSuccess(`Laporan Rekap Aktivitas (${format.toUpperCase()}) berhasil diunduh.`);
    } catch (err) {
      toast.showError(err.message || 'Gagal mengunduh laporan rekap aktivitas.');
    } finally {
      setIsExportingRecap(null);
    }
  };

  // Export transaction details for current selection
  const handleExportTransactions = async (format) => {
    setIsExportingTx(format);
    try {
      const endpoint = adminApi.getTransactionsExportUrl({
        format,
        activity_id: selectedActivityId || undefined,
        type: txType || undefined,
        search: txSearch.trim() || undefined
      });
      const ext = format === 'excel' ? 'xls' : 'csv';
      const prefix = selectedActivity ? selectedActivity.name.toLowerCase().replace(/\s+/g, '-') : 'all-activities';
      await downloadReport(endpoint, `${prefix}-transactions-report.${ext}`);
      toast.showSuccess(`Detail Transaksi (${format.toUpperCase()}) berhasil diunduh.`);
    } catch (err) {
      toast.showError(err.message || 'Gagal mengunduh detail transaksi.');
    } finally {
      setIsExportingTx(null);
    }
  };

  // Refund handler
  const onConfirmRefund = async (txId, notes) => {
    setIsSubmittingRefund(true);
    try {
      await adminApi.refundTransaction(txId, { notes });
      toast.showSuccess('Refund berhasil diproses dan saldo telah dikembalikan ke peserta.');
      setSelectedTxForRefund(null);
      refetchSummary();
      fetchTransactions(page);
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
          marginBottom: '2rem'
        }}
      >
        <div style={{ flex: '1 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-primary-600)' }}>
            <Waves size={24} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audit & Analitik Event
            </span>
          </div>
          <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Rekapitulasi Transaksi per Aktivitas
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Ringkasan detail transaksi per aktivitas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefreshAll}
            disabled={isLoadingSummary || isLoadingTx}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <RefreshCw size={16} className={isLoadingSummary || isLoadingTx ? 'loading-spin' : ''} /> Refresh
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={Boolean(isExportingRecap) || isLoadingSummary}
            onClick={() => handleExportRecap('excel')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            {isExportingRecap === 'excel' ? (
              <Loader2 size={16} className="loading-spin" />
            ) : (
              <FileSpreadsheet size={16} style={{ color: 'var(--color-success-primary)' }} />
            )}
            Ekspor Rekap (Excel)
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <AdminNavTabs />

      {/* Top Highlight KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <SummaryMetricCard
          title="Total Pemakaian Kredit"
          value={isLoadingSummary ? '...' : formatCurrency(summary?.total_net_amount || 0)}
          subtitle={`Kotor: ${formatCurrency(summary?.total_gross_amount || 0)}`}
          icon={<TrendingUp size={20} />}
          color="var(--color-primary-600)"
          bgColor="var(--color-primary-50)"
        />

        <SummaryMetricCard
          title="Frekuensi Main"
          value={isLoadingSummary ? '...' : `${summary?.total_deductions || 0} Kali`}
          subtitle={`${summary?.total_activities || 0} Aktivitas terdata`}
          icon={<ActivityIcon size={20} />}
          color="var(--color-sport-orange)"
          bgColor="var(--color-sport-orange-bg)"
        />

        <SummaryMetricCard
          title="Partisipan"
          value={isLoadingSummary ? '...' : `${summary?.total_unique_participants || 0} Orang`}
          subtitle="Partisipan aktif aktivitas"
          icon={<Users size={20} />}
          color="var(--color-success-primary)"
          bgColor="var(--color-success-bg)"
        />
      </div>

      {/* Master View: Activity Recap Cards with Selection Affordance */}
      <ActivityRecapSection
        activities={activities}
        summary={summary}
        isLoading={isLoadingSummary}
        activeFilterId={selectedActivityId}
        onFilterLedger={(actId) => setSelectedActivityId(actId)}
        onClearFilter={() => setSelectedActivityId('')}
        title="Ringkasan per Aktivitas"
        subtitle="Pilih salah satu aktivitas di bawah untuk melihat detail transaksinya."
        filterButtonText="Lihat Detail Transaksi"
        selectedButtonText="Sedang Ditampilkan"
        showFullAnalyticsLink={false}
      />

      {/* Detail View: Granular Transaction Audit Ledger */}
      <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-600)' }}>
              <ActivityIcon size={20} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Riwayat Transaksi
              </span>
            </div>
            <h2 style={{ margin: '0.15rem 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span>Detail Transaksi: {selectedActivity ? selectedActivity.name : 'Semua Aktivitas'}</span>
              {selectedActivity && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-700)',
                    background: 'var(--color-primary-50)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    border: '1px solid var(--color-primary-200)'
                  }}
                >
                  Tarif: {formatCurrency(selectedActivity.price)}
                </span>
              )}
            </h2>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {selectedActivity
                ? `Mutasi pemotongan dan pengembalian dana untuk aktivitas ${selectedActivity.name}.`
                : 'Menampilkan riwayat transaksi untuk seluruh aktivitas air.'}
            </p>
          </div>

          {/* Dedicated export buttons for the current transaction view */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={Boolean(isExportingTx) || isLoadingTx || transactions.length === 0}
              onClick={() => handleExportTransactions('csv')}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {isExportingTx === 'csv' ? (
                <Loader2 size={14} className="loading-spin" />
              ) : (
                <FileText size={14} style={{ color: 'var(--color-sport-orange)' }} />
              )}
              Ekspor Transaksi (CSV)
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={Boolean(isExportingTx) || isLoadingTx || transactions.length === 0}
              onClick={() => handleExportTransactions('excel')}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {isExportingTx === 'excel' ? (
                <Loader2 size={14} className="loading-spin" />
              ) : (
                <FileSpreadsheet size={14} style={{ color: 'var(--color-success-primary)' }} />
              )}
              Ekspor Transaksi (Excel)
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
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
            marginBottom: '1.25rem',
            overflow: 'visible',
            position: 'relative',
            zIndex: 10
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
              placeholder={selectedActivity ? `Cari peserta di ${selectedActivity.name}...` : 'Cari nama atau kode peserta...'}
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {selectedActivity && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: '1px solid var(--color-primary-200)'
                }}
              >
                <span>
                  Aktivitas : <strong>{selectedActivity.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedActivityId('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 0,
                    color: 'var(--color-primary-700)'
                  }}
                  title="Hapus filter aktivitas"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <TransactionTypeFilter
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
            />
          </div>
        </div>

        {/* Transaction Table */}
        {isLoadingTx && transactions.length === 0 ? (
          <div
            className="sport-card"
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <RefreshCw size={28} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Memuat data transaksi {selectedActivity ? selectedActivity.name : 'aktivitas'}...
            </p>
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
              <strong>{pagination.totalPages}</strong> ({pagination.total} transaksi)
            </span>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pagination.page <= 1 || isLoadingTx}
                onClick={() => handlePageChange(pagination.page - 1)}
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pagination.page >= pagination.totalPages || isLoadingTx}
                onClick={() => handlePageChange(pagination.page + 1)}
                style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Berikutnya <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

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
