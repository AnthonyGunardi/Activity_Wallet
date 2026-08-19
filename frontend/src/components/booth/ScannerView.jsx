import { useState } from 'react';
import { QrCode, Search, Camera, RefreshCw } from 'lucide-react';

/**
 * ScannerView Component
 * Provides camera scanner UI and fast manual QR token input fallback for outdoor booth reliability.
 *
 * @param {{
 *   onScan: (code: string) => void,
 *   isScanning: boolean
 * }} props
 */
export function ScannerView({ onScan, isScanning }) {
  const [manualCode, setManualCode] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
    }
  };

  const handlePresetSelect = (code) => {
    setManualCode(code);
    onScan(code);
  };

  return (
    <div
      className="sport-card"
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', color: 'var(--color-primary-600)' }}>
        <QrCode size={24} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
          Scanner Booth Aktivitas
        </h2>
      </div>

      {/* Camera Viewfinder Mock / Interactive Scanner */}
      <div
        style={{
          width: '100%',
          aspectRatio: '16/10',
          maxHeight: '260px',
          background: '#0f172a',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
        }}
      >
        {/* Animated Green Viewfinder Box */}
        <div
          style={{
            width: '180px',
            height: '180px',
            border: '2px dashed var(--color-success-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <Camera size={36} style={{ opacity: 0.7 }} />
        </div>

        <span style={{ fontSize: '0.75rem', marginTop: '0.75rem', opacity: 0.8, fontWeight: 500 }}>
          Arahkan kamera ke QR gelang peserta atau masukkan token di bawah
        </span>
      </div>

      {/* Manual Input Fallback Form */}
      <form onSubmit={handleManualSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="boothManualInput" className="form-label" style={{ fontWeight: 600 }}>
            Input Manual Kode QR Token
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="boothManualInput"
              type="text"
              className="form-input"
              placeholder="Contoh: SEPA-001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              disabled={isScanning}
              style={{
                textTransform: 'uppercase',
                fontSize: '1.125rem',
                letterSpacing: '0.05em',
                paddingLeft: '2.75rem'
              }}
            />
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-dim)'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isScanning || !manualCode.trim()}
          style={{
            width: '100%',
            padding: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={18} className="loading-spin" /> Memindai Peserta...
            </>
          ) : (
            'Cari Peserta'
          )}
        </button>
      </form>

      {/* Preset Quick Scan Buttons */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          ⚡ Preset Token Peserta Uji Coba:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['SEPA-001', 'SEPA-002', 'SEPA-003', 'SEPA-004'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handlePresetSelect(code)}
              disabled={isScanning}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.625rem' }}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
