import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

/**
 * Custom hook managing Admin Activity catalog list, status filtering,
 * activity creation, and updates.
 */
export function useAdminActivities() {
  const [activities, setActivities] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getActivities({
        status: statusFilter || undefined
      });

      const raw = res.activities || res.data?.activities || [];
      const sorted = [...raw].sort((a, b) => {
        if (typeof a.id === 'number' && typeof b.id === 'number') {
          return a.id - b.id;
        }
        return String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true });
      });
      setActivities(sorted);
    } catch (err) {
      setError(err.message || 'Gagal memuat data aktivitas.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCreateActivity = async (payload) => {
    const created = await adminApi.createActivity(payload);
    await fetchActivities();
    return created;
  };

  const handleUpdateActivity = async (id, payload) => {
    const updated = await adminApi.updateActivity(id, payload);
    await fetchActivities();
    return updated;
  };

  const handleToggleStatus = async (activity, newStatus) => {
    const updated = await adminApi.updateActivity(activity.id, { status: newStatus });
    await fetchActivities();
    return updated;
  };

  return {
    activities,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    fetchActivities,
    handleCreateActivity,
    handleUpdateActivity,
    handleToggleStatus
  };
}
