import { useEffect } from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WifiOff, Wifi, X } from 'lucide-react';

/**
 * OfflineBanner component
 * Displays persistent, high-contrast visual cues when the client loses network connectivity
 * on the island, and a transient recovery banner upon reconnection.
 */
export function OfflineBanner() {
  const { isOnline, wasOffline, dismissReconnected } = useNetworkStatus();

  useEffect(() => {
    if (isOnline && wasOffline) {
      const timer = setTimeout(() => {
        dismissReconnected();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, dismissReconnected]);

  if (!isOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          background: 'linear-gradient(90deg, #b91c1c, #dc2626)',
          color: '#ffffff',
          padding: '0.625rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          zIndex: 9999,
          position: 'sticky',
          top: 0,
          textAlign: 'center'
        }}
      >
        <WifiOff size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Koneksi Terputus:</strong> Anda sedang offline.
          Mohon tunggu koneksi pulau pulih sebelum melakukan scan atau mutasi saldo.
        </span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          background: 'linear-gradient(90deg, #059669, #10b981)',
          color: '#ffffff',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 9999,
          position: 'sticky',
          top: 0,
          textAlign: 'center'
        }}
      >
        <Wifi size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Koneksi Pulih:</strong> Perangkat kembali online dan siap beroperasi.
        </span>
        <button
          type="button"
          onClick={dismissReconnected}
          aria-label="Tutup notifikasi"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}
