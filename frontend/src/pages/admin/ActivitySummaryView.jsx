import { useState, useMemo } from 'react';
import { useAdminActivitySummary } from '../../hooks/useAdminActivitySummary';
import { AdminNavTabs } from '../../components/admin/AdminNavTabs';
import { SummaryMetricCard } from '../../components/admin/SummaryMetricCard';
import { useToast } from '../../hooks/useToast';
import { downloadReport } from '../../utils/downloadHelper';
import { formatCurrency } from '../../utils/formatters';
import {
  Waves,
  RefreshCw,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  TrendingUp,
  RotateCcw,
  Users,
  Activity as ActivityIcon
} from 'lucide-react';

/**
 * ActivitySummaryView Page
 * Dedicated comprehensive analytics and auditing view for activity (wahana) performance,
 * credit utilization, unique participants, and CSV/Excel export.
 */
export function ActivitySummaryView() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('net_amount');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isExporting, setIsExporting] = useState(null);

  const toast = useToast();

  const {
    summary,
    activities,
    isLoading,
    refetch
  } = useAdminActivitySummary({
    status: statusFilter || undefined
  });

  const handleExport = async (format) => {
    setIsExporting(format);
    try {
      const query = new URLSearchParams();
      query.append('format', format);
      if (statusFilter) query.append('status', statusFilter);

      const endpoint = `/api/v1/admin/reports/activities/export?${query.toString()}`;
      const ext = format === 'excel' ? 'xls' : 'csv';
      await downloadReport(endpoint, `activities-recap-report.${ext}`);
      toast.showSuccess(`Laporan Rekap Wahana (${format.toUpperCase()}) berhasil diunduh.`);
    } catch (err) {
      toast.showError(err.message || 'Gagal mengunduh laporan rekap wahana.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Filter by search name and sort
  const filteredAndSortedActivities = useMemo(() => {
    let result = [...activities];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [activities, search, sortField, sortDirection]);

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} style={{ opacity: 0.4, marginLeft: '0.25rem' }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={13} style={{ color: 'var(--color-primary-600)', marginLeft: '0.25rem' }} />
    ) : (
      <ArrowDown size={13} style={{ color: 'var(--color-primary-600)', marginLeft: '0.25rem' }} />
    );
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
            <Waves size={24} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audit & Analitik Event
            </span>
          </div>
          <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Rekapitulasi Transaksi per Wahana
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Analisis lengkap volume transaksi, retur refund, serapan kredit, dan partisipasi peserta di tiap wahana.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={refetch}
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <RefreshCw size={16} className={isLoading ? 'loading-spin' : ''} /> Refresh
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={Boolean(isExporting) || isLoading}
            onClick={() => handleExport('csv')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            {isExporting === 'csv' ? (
              <Loader2 size={16} className="loading-spin" />
            ) : (
              <FileText size={16} style={{ color: 'var(--color-primary-600)' }} />
            )}
            Ekspor CSV
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={Boolean(isExporting) || isLoading}
            onClick={() => handleExport('excel')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            {isExporting === 'excel' ? (
              <Loader2 size={16} className="loading-spin" />
            ) : (
              <FileSpreadsheet size={16} style={{ color: 'var(--color-success-primary)' }} />
            )}
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <AdminNavTabs />

      {/* Highlight KPI Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <SummaryMetricCard
          title="Total Pendapatan Bersih"
          value={isLoading ? '...' : formatCurrency(summary?.total_net_amount || 0)}
          subtitle={`Kotor: ${formatCurrency(summary?.total_gross_amount || 0)}`}
          icon={<TrendingUp size={20} />}
          color="var(--color-primary-600)"
          bgColor="var(--color-primary-50)"
        />

        <SummaryMetricCard
          title="Frekuensi Main"
          value={isLoading ? '...' : `${summary?.total_deductions || 0} Kali`}
          subtitle={`${summary?.total_activities || 0} Aktivitas terdata`}
          icon={<ActivityIcon size={20} />}
          color="var(--color-sport-orange)"
          bgColor="var(--color-sport-orange-bg)"
        />

        <SummaryMetricCard
          title="Peserta Unik Terlayani"
          value={isLoading ? '...' : `${summary?.total_unique_participants || 0} Orang`}
          subtitle="Partisipan aktif wahana"
          icon={<Users size={20} />}
          color="var(--color-success-primary)"
          bgColor="var(--color-success-bg)"
        />

        <SummaryMetricCard
          title="Total Refund"
          value={isLoading ? '...' : `${summary?.total_refunds || 0} Kali`}
          subtitle={`Total: ${formatCurrency(summary?.total_refund_amount || 0)}`}
          icon={<RotateCcw size={20} />}
          color="var(--color-danger-primary)"
          bgColor="var(--color-danger-bg)"
        />
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
            placeholder="Cari nama aktivitas / wahana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem', width: '170px' }}
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="INACTIVE">Nonaktif Saja</option>
          </select>
        </div>
      </div>

      {/* Analytical Table */}
      <div
        className="sport-card"
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-main)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-muted)', width: '48px' }}>
                  No
                </th>
                <th
                  onClick={() => handleSort('name')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Nama Aktivitas {renderSortIcon('name')}
                  </span>
                </th>
                <th style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-muted)', width: '90px' }}>
                  Status
                </th>
                <th
                  onClick={() => handleSort('price')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Tarif {renderSortIcon('price')}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('deduction_count')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    Total Main {renderSortIcon('deduction_count')}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('refund_count')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    Refund {renderSortIcon('refund_count')}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('gross_amount')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Omzet Kotor {renderSortIcon('gross_amount')}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('net_amount')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'right', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Omzet Bersih {renderSortIcon('net_amount')}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('unique_participants_count')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'center', whiteSpace: 'nowrap' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    Peserta Unik {renderSortIcon('unique_participants_count')}
                  </span>
                </th>
                <th
                  onClick={() => handleSort('share_percentage')}
                  style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)', cursor: 'pointer', textAlign: 'right', minWidth: '150px' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Pangsa Omzet {renderSortIcon('share_percentage')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                    <RefreshCw size={28} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Memuat data rekapitulasi...</p>
                  </td>
                </tr>
              ) : filteredAndSortedActivities.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Tidak ada aktivitas yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredAndSortedActivities.map((act, index) => (
                  <tr
                    key={act.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background 0.15s ease'
                    }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {act.name}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          textTransform: 'uppercase',
                          background: act.status === 'ACTIVE' ? 'var(--color-secondary-50)' : '#f1f5f9',
                          color: act.status === 'ACTIVE' ? 'var(--color-secondary-700)' : 'var(--color-text-muted)',
                          border: `1px solid ${act.status === 'ACTIVE' ? 'var(--color-secondary-200)' : '#e2e8f0'}`
                        }}
                      >
                        {act.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {formatCurrency(act.price)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {act.deduction_count}x
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      {act.refund_count > 0 ? (
                        <span style={{ color: 'var(--color-danger-primary)', fontWeight: 700 }}>
                          {act.refund_count}x
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-dim)' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                      {formatCurrency(act.gross_amount)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                      {formatCurrency(act.net_amount)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {act.unique_participants_count}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.8125rem' }}>
                          {act.share_percentage}%
                        </span>
                        <div
                          style={{
                            width: '90px',
                            height: '5px',
                            background: 'var(--color-border)',
                            borderRadius: '999px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(0, act.share_percentage))}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%)',
                              borderRadius: '999px'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
