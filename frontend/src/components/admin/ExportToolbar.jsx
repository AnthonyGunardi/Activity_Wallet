import { useState } from 'react';
import { downloadReport } from '../../utils/downloadHelper';
import { useToast } from '../../hooks/useToast';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

/**
 * ExportToolbar component
 * Provides quick-action download buttons for participant balance reconciliation
 * and full transaction audit ledgers in CSV and Microsoft Excel formats.
 */
export function ExportToolbar() {
  const toast = useToast();
  const [downloadingType, setDownloadingType] = useState(null);

  const handleDownload = async (type, format, endpoint, defaultFilename) => {
    const key = `${type}-${format}`;
    setDownloadingType(key);
    try {
      await downloadReport(endpoint, defaultFilename);
      toast.showSuccess(`Laporan ${type} (${format.toUpperCase()}) berhasil diunduh.`);
    } catch (err) {
      toast.showError(err.message || 'Gagal mengunduh laporan.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div
      className="sport-card"
      style={{
        background: 'var(--color-bg-surface)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-600)' }}>
          <Download size={18} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            Ekspor Data & Laporan
          </h3>
        </div>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Unduh data peserta dan riwayat transaksi dalam format CSV atau Excel.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center' }}>
        {/* Participants CSV */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(downloadingType)}
          onClick={() =>
            handleDownload(
              'Peserta',
              'csv',
              '/api/v1/admin/reports/participants/export?format=csv',
              'participants-report.csv'
            )
          }
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {downloadingType === 'Peserta-csv' ? (
            <Loader2 size={14} className="loading-spin" />
          ) : (
            <FileText size={14} style={{ color: 'var(--color-primary-500)' }} />
          )}
          Peserta (CSV)
        </button>

        {/* Participants Excel */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(downloadingType)}
          onClick={() =>
            handleDownload(
              'Peserta',
              'excel',
              '/api/v1/admin/reports/participants/export?format=excel',
              'participants-report.xls'
            )
          }
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {downloadingType === 'Peserta-excel' ? (
            <Loader2 size={14} className="loading-spin" />
          ) : (
            <FileSpreadsheet size={14} style={{ color: 'var(--color-success-primary)' }} />
          )}
          Peserta (Excel)
        </button>

        {/* Transactions CSV */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(downloadingType)}
          onClick={() =>
            handleDownload(
              'Ledger',
              'csv',
              '/api/v1/admin/reports/transactions/export?format=csv',
              'transactions-report.csv'
            )
          }
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {downloadingType === 'Ledger-csv' ? (
            <Loader2 size={14} className="loading-spin" />
          ) : (
            <FileText size={14} style={{ color: 'var(--color-sport-orange)' }} />
          )}
          Transaksi (CSV)
        </button>

        {/* Transactions Excel */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(downloadingType)}
          onClick={() =>
            handleDownload(
              'Ledger',
              'excel',
              '/api/v1/admin/reports/transactions/export?format=excel',
              'transactions-report.xls'
            )
          }
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {downloadingType === 'Ledger-excel' ? (
            <Loader2 size={14} className="loading-spin" />
          ) : (
            <FileSpreadsheet size={14} style={{ color: 'var(--color-success-primary)' }} />
          )}
          Transaksi (Excel)
        </button>

        {/* Activities Recap CSV */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(downloadingType)}
          onClick={() =>
            handleDownload(
              'Rekap Wahana',
              'csv',
              '/api/v1/admin/reports/activities/export?format=csv',
              'activities-recap-report.csv'
            )
          }
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {downloadingType === 'Rekap Wahana-csv' ? (
            <Loader2 size={14} className="loading-spin" />
          ) : (
            <FileText size={14} style={{ color: '#8b5cf6' }} />
          )}
          Rekap Wahana (CSV)
        </button>

        {/* Activities Recap Excel */}
        <button
          type="button"
          className="btn btn-secondary"
          disabled={Boolean(downloadingType)}
          onClick={() =>
            handleDownload(
              'Rekap Wahana',
              'excel',
              '/api/v1/admin/reports/activities/export?format=excel',
              'activities-recap-report.xls'
            )
          }
          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {downloadingType === 'Rekap Wahana-excel' ? (
            <Loader2 size={14} className="loading-spin" />
          ) : (
            <FileSpreadsheet size={14} style={{ color: '#8b5cf6' }} />
          )}
          Rekap Wahana (Excel)
        </button>
      </div>
    </div>
  );
}
