import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, X, QrCode } from 'lucide-react';

/**
 * QRViewer Component
 * Renders a high-contrast, sunlight-scannable QR code of the participant's unique token.
 * Provides a fullscreen modal zoom toggle for effortless scanning at outdoor booths.
 *
 * @param {{
 *   qrCode: string,
 *   participantName: string
 * }} props
 */
export function QRViewer({ qrCode, participantName }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!qrCode) return null;

  return (
    <>
      <div
        className="sport-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '1.75rem',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary-600)' }}>
          <QrCode size={20} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            QR Peserta
          </span>
        </div>

        {/* High-Contrast White Container for Direct Sunlight Scanning */}
        <div
          style={{
            background: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--color-primary-100)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <QRCodeSVG
            value={qrCode}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              letterSpacing: '0.08em',
              background: 'var(--color-bg-main)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            {qrCode}
          </span>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', marginBottom: '1rem' }}>
          Tunjukkan QR ini ke staff booth aktivitas
        </p>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsZoomed(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            padding: '0.5rem 1rem'
          }}
        >
          <Maximize2 size={16} /> Perbesar QR
        </button>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-2xl)',
              textAlign: 'center',
              maxWidth: '90vw',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text-main)' }}>
                  Tampilan Penuh QR
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {participantName}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsZoomed(false)}
                style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                display: 'inline-block'
              }}
            >
              <QRCodeSVG
                value={qrCode}
                size={260}
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-primary-600)',
                  letterSpacing: '0.08em'
                }}
              >
                {qrCode}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsZoomed(false)}
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
