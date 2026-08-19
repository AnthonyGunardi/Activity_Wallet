import { useState } from 'react';
import { X, Upload, RefreshCw } from 'lucide-react';

/**
 * BulkImportModal Component
 * Allows batch registration of event attendees via copy-pasted CSV/names list.
 *
 * @param {{
 *   isOpen: boolean,
 *   isSubmitting: boolean,
 *   onSubmit: (participants: Array<{ name: string, initial_credit: number }>) => void,
 *   onClose: () => void
 * }} props
 */
export function BulkImportModal({ isOpen, isSubmitting, onSubmit, onClose }) {
  const [csvText, setCsvText] = useState('');

  if (!isOpen) return null;

  const parseParticipants = () => {
    const lines = csvText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return lines.map((line) => {
      const parts = line.split(',');
      const name = parts[0]?.trim();
      const credit = parts[1] ? Number(parts[1].trim()) : 1000000;
      return {
        name,
        initial_credit: isNaN(credit) ? 1000000 : credit
      };
    }).filter((p) => p.name && p.name.length > 0);
  };

  const parsedList = parseParticipants();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parsedList.length === 0) return;
    onSubmit(parsedList);
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
          maxWidth: '540px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
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
              <Upload size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Import Peserta (Batch / CSV)
            </h3>
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

        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Tempel daftar peserta (1 baris per peserta).
          Format: <code>Nama Peserta</code> atau <code>Nama, SaldoAwal</code>.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <textarea
              rows={8}
              className="form-input"
              placeholder="Masukkan daftar nama peserta&#10;Contoh:&#10;Ahmad Fauzi&#10;Budi Santoso, 1000000&#10;Citra Lestari"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              disabled={isSubmitting}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Total Terdeteksi: <strong style={{ color: 'var(--color-primary-600)' }}>{parsedList.length} Peserta</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || parsedList.length === 0}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="loading-spin" /> Mengimpor...
                </>
              ) : (
                `Import ${parsedList.length} Peserta`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
