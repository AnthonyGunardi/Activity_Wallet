import { useState, useEffect, useCallback } from 'react';
import { participantApi } from '../api/participantApi';

/**
 * Custom hook to fetch, cache, and refresh participant wallet data by QR token.
 *
 * @param {string} [initialQrCode='']
 * @returns {{
 *   wallet: Object|null,
 *   qrCode: string,
 *   setQrCode: (code: string) => void,
 *   isLoading: boolean,
 *   error: string|null,
 *   refreshWallet: () => Promise<void>
 * }}
 */
export function useParticipantWallet(initialQrCode = '') {
  const [qrCode, setQrCode] = useState(initialQrCode);
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async (code) => {
    if (!code || !code.trim()) {
      setWallet(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await participantApi.getWallet(code.trim());
      setWallet(data);
    } catch (err) {
      setWallet(null);
      setError(err.message || 'Gagal memuat informasi dompet peserta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (qrCode) {
      fetchWallet(qrCode);
    } else {
      setWallet(null);
      setError(null);
      setIsLoading(false);
    }
  }, [qrCode, fetchWallet]);

  const refreshWallet = useCallback(async () => {
    if (qrCode) {
      await fetchWallet(qrCode);
    }
  }, [qrCode, fetchWallet]);

  return {
    wallet,
    qrCode,
    setQrCode,
    isLoading,
    error,
    refreshWallet
  };
}
