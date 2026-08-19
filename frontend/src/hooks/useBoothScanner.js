import { useState, useEffect, useCallback } from 'react';
import { boothApi } from '../api/boothApi';

/**
 * Custom hook managing booth scanner state, verification preview, debit submission,
 * and recent transaction logs.
 *
 * @returns {{
 *   scanData: Object|null,
 *   selectedActivity: Object|null,
 *   setSelectedActivity: (act: Object|null) => void,
 *   isScanning: boolean,
 *   isSubmitting: boolean,
 *   error: string|null,
 *   lastReceipt: Object|null,
 *   recentTransactions: Array,
 *   handleScan: (code: string) => Promise<void>,
 *   handleConfirmDeduction: (notes?: string) => Promise<void>,
 *   clearScan: () => void,
 *   dismissReceipt: () => void,
 *   refreshRecent: () => Promise<void>
 * }}
 */
export function useBoothScanner() {
  const [scanData, setScanData] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const refreshRecent = useCallback(async () => {
    try {
      const data = await boothApi.getRecentTransactions();
      setRecentTransactions(data.transactions || []);
    } catch (_err) {
      // Background fetch failure does not block booth operations
    }
  }, []);

  useEffect(() => {
    refreshRecent();
  }, [refreshRecent]);

  const handleScan = useCallback(async (code) => {
    if (!code || !code.trim()) return;

    setIsScanning(true);
    setError(null);
    setSelectedActivity(null);

    try {
      const data = await boothApi.scanParticipant(code.trim());
      setScanData(data);
    } catch (err) {
      setScanData(null);
      setError(err.message || 'Gagal memindai peserta.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleConfirmDeduction = useCallback(async (notes = '') => {
    if (!scanData || !selectedActivity) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await boothApi.createDeduction({
        qr_code: scanData.participant.qr_code,
        activity_id: selectedActivity.id,
        notes: notes || undefined
      });

      setLastReceipt(result);
      setScanData(null);
      setSelectedActivity(null);
      await refreshRecent();
    } catch (err) {
      setError(err.message || 'Gagal melakukan pemotongan saldo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [scanData, selectedActivity, refreshRecent]);

  const clearScan = useCallback(() => {
    setScanData(null);
    setSelectedActivity(null);
    setError(null);
  }, []);

  const dismissReceipt = useCallback(() => {
    setLastReceipt(null);
  }, []);

  return {
    scanData,
    selectedActivity,
    setSelectedActivity,
    isScanning,
    isSubmitting,
    error,
    lastReceipt,
    recentTransactions,
    handleScan,
    handleConfirmDeduction,
    clearScan,
    dismissReceipt,
    refreshRecent
  };
}
