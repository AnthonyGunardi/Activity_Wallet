import { useState, useRef } from 'react';
import { X, Upload, RefreshCw, FileSpreadsheet, Download, AlertCircle, CheckCircle2, FileUp } from 'lucide-react';
import { parseParticipantExcel, generateParticipantTemplate } from '../../utils/excelHelper';
import { formatCurrency } from '../../utils/formatters';

/**
 * BulkImportModal Component
 * Facilitates bulk attendee registration through Excel (.xlsx / .xls) upload,
 * featuring interactive file parsing, real-time preview, template download, and row validation.
 *
 * @param {{
 *   isOpen: boolean,
 *   isSubmitting: boolean,
 *   onSubmit: (participants: Array<{ name: string, initial_credit: number, qr_code?: string }>) => void,
 *   onClose: () => void
 * }} props
 */
export function BulkImportModal({ isOpen, isSubmitting, onSubmit, onClose }) {
  const [file, setFile] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [errors, setErrors] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setParticipants([]);
    setErrors([]);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileProcess = async (selectedFile) => {
    if (!selectedFile) return;

    // Check extension
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setParseError('Format file tidak didukung. Harap unggah file Microsoft Excel (.xlsx atau .xls).');
      return;
    }

    setFile(selectedFile);
    setParseError(null);
    setIsParsing(true);

    try {
      const result = await parseParticipantExcel(selectedFile);
      setParticipants(result.participants);
      setErrors(result.errors || []);
      if (result.participants.length === 0 && (result.errors || []).length === 0) {
        setParseError('File Excel tidak memiliki baris data peserta yang valid.');
      }
    } catch (err) {
      setParseError(err.message || 'Gagal membaca isi file Excel.');
      setParticipants([]);
      setErrors([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFileProcess(selected);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileProcess(droppedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (participants.length === 0 || isSubmitting) return;
    onSubmit(participants);
  };

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
          maxWidth: '620px',
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
            background: 'var(--color-bg-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Impor Data Peserta (Excel / .xlsx)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Unggah file spreadsheet untuk mendaftarkan peserta secara massal.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Tutup"
            style={{ padding: '0.35rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Template download banner */}
          <div
            style={{
              background: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.875rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Format kolom yang didukung: <strong>Nama Peserta</strong> (wajib),{' '}
              <strong>Saldo Awal</strong>, dan <strong>Kode QR</strong> (opsional).
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => generateParticipantTemplate()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                padding: '0.375rem 0.75rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Download size={14} /> Download Template
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
              background: isDragOver ? 'var(--color-primary-50)' : 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.25rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-label="Upload File Excel"
            />
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem'
              }}
            >
              <FileUp size={22} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
              {file ? file.name : 'Klik atau drag file Excel ke sini'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {file ? `${(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti file` : 'Mendukung format .xlsx dan .xls'}
            </div>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-primary-600)', fontSize: '0.875rem' }}>
              <RefreshCw size={18} className="loading-spin" style={{ display: 'inline', marginRight: '0.5rem' }} /> Membaca data spreadsheet...
            </div>
          )}

          {/* Global Parse Error */}
          {parseError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{parseError}</div>
            </div>
          )}

          {/* Row Validation Warnings */}
          {errors.length > 0 && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                color: '#D97706',
                fontSize: '0.8125rem',
                marginBottom: '1rem',
                maxHeight: '100px',
                overflowY: 'auto'
              }}
            >
              <strong>Peringatan Validasi ({errors.length}):</strong>
              <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Participants Preview Table */}
          {participants.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" />
                  Pratinjau Data ({participants.length} Peserta)
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--color-danger)' }}
                >
                  Hapus File
                </button>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '0.5rem 0.75rem', width: '40px' }}>#</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Nama Peserta</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Saldo Awal</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Kode QR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{p.name}</td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                          {formatCurrency(p.initial_credit)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-dim)', fontFamily: 'monospace' }}>
                          {p.qr_code || <span style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>Otomatis</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            background: 'var(--color-bg-subtle)'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || participants.length === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="loading-spin" /> Mengimpor...
              </>
            ) : (
              <>
                <Upload size={16} />
                {participants.length > 0 ? `Import ${participants.length} Peserta` : 'Import Peserta'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
