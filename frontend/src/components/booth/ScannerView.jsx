import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Search,
  CameraOff,
  RefreshCw,
  SwitchCamera,
  AlertCircle,
  Video,
  VideoOff
} from 'lucide-react';

/**
 * ScannerView Component
 * Provides live HTML5 camera QR scanner with automatic device detection,
 * camera flipping, permission/error recovery, and fast manual QR token input fallback.
 *
 * @param {{
 *   onScan: (code: string) => void,
 *   isScanning: boolean
 * }} props
 */
export function ScannerView({ onScan, isScanning }) {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'initializing' | 'active' | 'error' | 'disabled'
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);

  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });

  // Initialize and handle camera stream lifecycle
  useEffect(() => {
    let isMounted = true;
    let html5QrCode = null;

    const initScanner = async () => {
      if (!cameraActive) {
        setCameraStatus('disabled');
        return;
      }

      setCameraStatus('initializing');
      setCameraError('');

      // Guard for non-browser or environments without mediaDevices
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        if (isMounted) {
          setCameraStatus('error');
          setCameraError('Kamera tidak didukung atau izin tidak tersedia di peramban ini.');
        }
        return;
      }

      try {
        const qrContainer = document.getElementById('booth-qr-reader');
        if (!qrContainer) {
          if (isMounted) setCameraStatus('error');
          return;
        }

        html5QrCode = new Html5Qrcode('booth-qr-reader');
        scannerRef.current = html5QrCode;

        // Query available video input devices
        let availableDevices = [];
        try {
          availableDevices = await Html5Qrcode.getCameras();
          if (isMounted && availableDevices && availableDevices.length > 0) {
            setCameras(availableDevices);
          }
        } catch (_devicesErr) {
          // Fallback to environment facingMode if device enumeration fails
        }

        const cameraConfig = availableDevices.length > 0 && availableDevices[selectedCameraIndex]
          ? { deviceId: { exact: availableDevices[selectedCameraIndex].id } }
          : { facingMode: 'environment' };

        const scanConfig = {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.6
        };

        await html5QrCode.start(
          cameraConfig,
          scanConfig,
          (decodedText) => {
            const now = Date.now();
            // Debounce rapid repeated frames and skip when network request is in-flight
            if (
              decodedText &&
              !isScanning &&
              (decodedText !== lastScannedRef.current.code || now - lastScannedRef.current.time > 2500)
            ) {
              lastScannedRef.current = { code: decodedText, time: now };
              onScan(decodedText.trim());
            }
          },
          () => {
            // Ignore per-frame qr decode misses
          }
        );

        if (isMounted) {
          setCameraStatus('active');
        }
      } catch (err) {
        if (isMounted) {
          setCameraStatus('error');
          const errorMsg = err?.message || String(err);
          if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission')) {
            setCameraError('Izin akses kamera ditolak. Silakan izinkan kamera di pengaturan browser.');
          } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('DevicesNotFoundError')) {
            setCameraError('Kamera tidak terdeteksi pada perangkat.');
          } else {
            setCameraError('Tidak dapat membuka kamera. Pastikan kamera tidak digunakan oleh tab/aplikasi lain.');
          }
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        const instance = scannerRef.current;
        scannerRef.current = null;
        if (instance.isScanning) {
          instance
            .stop()
            .then(() => {
              try {
                instance.clear();
              } catch (_clearErr) {
                // Ignore DOM clear errors on unmount
              }
            })
            .catch((_stopErr) => {
              // Ignore stream stop errors on unmount
            });
        } else {
          try {
            instance.clear();
          } catch (_clearErr) {
            // Ignore DOM clear errors on unmount
          }
        }
      }
    };
  }, [cameraActive, selectedCameraIndex, isScanning, onScan]);

  const handleSwitchCamera = () => {
    if (cameras.length > 1) {
      setSelectedCameraIndex((prev) => (prev + 1) % cameras.length);
    }
  };

  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

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
      {/* Header & Camera Control Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-primary-600)' }}>
          <QrCode size={24} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>
            Scanner Aktivitas
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {cameras.length > 1 && cameraActive && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="btn btn-secondary"
              title="Ganti Kamera"
              aria-label="Ganti Kamera"
              style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <SwitchCamera size={15} />
              <span className="hide-mobile">Kamera ({selectedCameraIndex + 1}/{cameras.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleCamera}
            className={`btn ${cameraActive ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            title={cameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          >
            {cameraActive ? (
              <>
                <VideoOff size={15} />
                <span>Matikan</span>
              </>
            ) : (
              <>
                <Video size={15} />
                <span>Aktifkan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Camera Viewfinder Viewport */}
      <div className="qr-scanner-viewport">
        {/* Html5Qrcode Mount Target Container */}
        <div
          id="booth-qr-reader"
          style={{
            width: '100%',
            height: '100%',
            display: cameraStatus === 'active' ? 'block' : 'none'
          }}
        />

        {/* Viewfinder Laser & Frame Overlay when Camera is Active */}
        {cameraStatus === 'active' && (
          <>
            <div className="scanner-laser-line" />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  width: '190px',
                  height: '190px',
                  border: '2px dashed var(--color-success-primary)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
                  position: 'relative'
                }}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: 0,
                right: 0,
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 11
              }}
            >
              <span
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  color: '#ffffff',
                  fontWeight: 500
                }}
              >
                Arahkan QR peserta ke dalam kotak
              </span>
            </div>
          </>
        )}

        {/* Initializing State */}
        {cameraStatus === 'initializing' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: '#ffffff',
              padding: '1.5rem'
            }}
          >
            <RefreshCw size={32} className="loading-spin" style={{ color: 'var(--color-primary-500)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Memulai kamera...</span>
          </div>
        )}

        {/* Camera Disabled State */}
        {cameraStatus === 'disabled' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: '#ffffff',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <CameraOff size={36} style={{ opacity: 0.6 }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Kamera Dinonaktifkan</div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, maxWidth: '280px' }}>
              Nyalakan kamera di atas atau gunakan input kode peserta di bawah.
            </p>
          </div>
        )}

        {/* Camera Error / No Permission State */}
        {cameraStatus === 'error' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              color: '#ffffff',
              padding: '1.5rem',
              textAlign: 'center'
            }}
          >
            <AlertCircle size={36} style={{ color: 'var(--color-warning-primary)' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>Kamera Tidak Aktif</div>
            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0, maxWidth: '300px', lineHeight: 1.4 }}>
              {cameraError || 'Akses kamera tidak tersedia atau izin belum diberikan.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setCameraActive(false);
                setTimeout(() => setCameraActive(true), 150);
              }}
              className="btn btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.85rem',
                marginTop: '0.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <RefreshCw size={14} /> Coba Lagi
            </button>
          </div>
        )}
      </div>

      {/* Manual Input Fallback Form */}
      <form onSubmit={handleManualSubmit}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="boothManualInput" className="form-label" style={{ fontWeight: 600 }}>
            Masukkan Kode Peserta
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
            'Verifikasi Peserta →'
          )}
        </button>
      </form>

      {/* Preset Quick Scan Buttons */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          DATA PESERTA DEMO
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

