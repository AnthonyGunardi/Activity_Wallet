import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to track live browser network connectivity status.
 * Crucial for island outdoor conditions with intermittent Wi-Fi / cellular coverage.
 *
 * @returns {{
 *   isOnline: boolean,
 *   wasOffline: boolean,
 *   dismissReconnected: () => void
 * }}
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });

  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismissReconnected = useCallback(() => {
    setWasOffline(false);
  }, []);

  return {
    isOnline,
    wasOffline,
    dismissReconnected
  };
}
