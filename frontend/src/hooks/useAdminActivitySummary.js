import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

/**
 * Custom hook managing activity transactions recap summary,
 * including date range filtering, status filtering, and refetch capabilities.
 *
 * @param {Object} [initialFilters={}]
 * @param {string} [initialFilters.status]
 * @param {string} [initialFilters.start_date]
 * @param {string} [initialFilters.end_date]
 */
export function useAdminActivitySummary(initialFilters = {}) {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getActivitySummary(filters);
      const data = res.data || res;
      setSummary(data.summary || null);
      setActivities(data.activities || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat rekapitulasi wahana.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    summary,
    activities,
    filters,
    isLoading,
    error,
    refetch: fetchSummary,
    updateFilters,
    resetFilters
  };
}
