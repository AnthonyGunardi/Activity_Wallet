import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

/**
 * Custom hook managing Admin Dashboard KPIs, immutable transaction audit ledger,
 * filtering, pagination, and refund operations.
 */
export function useAdminLedger() {
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await adminApi.getDashboardSummary();
      setSummary(res.data || res);
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan dashboard.');
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoadingTransactions(true);
    setError(null);
    try {
      const res = await adminApi.getTransactions({
        page,
        limit: pagination.limit,
        type: typeFilter || undefined,
        search: search.trim() || undefined
      });

      setTransactions(res.transactions || res.data?.transactions || []);
      if (res.meta) {
        setPagination(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat transaksi.');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [pagination.limit, typeFilter, search]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleRefund = async (transactionId, notes) => {
    const result = await adminApi.refundTransaction(transactionId, { notes });
    // Refresh both ledger and summary stats
    await Promise.all([
      fetchSummary(),
      fetchTransactions(pagination.page)
    ]);
    return result;
  };

  return {
    summary,
    isLoadingSummary,
    transactions,
    pagination,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    isLoadingTransactions,
    error,
    fetchSummary,
    fetchTransactions,
    handleRefund
  };
}
