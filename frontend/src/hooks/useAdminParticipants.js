import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';

/**
 * Custom hook managing Admin Participant list, filters, pagination,
 * creation, batch import, and QR reissuance.
 */
export function useAdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchParticipants = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getParticipants({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined
      });

      setParticipants(res.participants || res.data?.participants || []);
      if (res.meta) {
        setPagination(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data peserta.');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchParticipants(1);
  }, [fetchParticipants]);

  const handleCreate = async (payload) => {
    const created = await adminApi.createParticipant(payload);
    await fetchParticipants(pagination.page);
    return created;
  };

  const handleBulkCreate = async (list) => {
    const result = await adminApi.bulkCreateParticipants(list);
    await fetchParticipants(1);
    return result;
  };

  const handleUpdate = async (participantId, payload) => {
    const updated = await adminApi.updateParticipant(participantId, payload);
    await fetchParticipants(pagination.page);
    return updated;
  };

  const handleDelete = async (participantId) => {
    const result = await adminApi.deleteParticipant(participantId);
    await fetchParticipants(pagination.page);
    return result;
  };

  const handleGetDetail = async (participantId) => {
    return await adminApi.getParticipantById(participantId);
  };

  const handleReissueQr = async (participantId) => {
    const result = await adminApi.reissueQr(participantId);
    await fetchParticipants(pagination.page);
    return result;
  };

  const handleToggleStatus = async (participant, newStatus) => {
    const updated = await adminApi.updateStatus(participant.id, newStatus);
    await fetchParticipants(pagination.page);
    return updated;
  };

  return {
    participants,
    pagination,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    fetchParticipants,
    handleCreate,
    handleBulkCreate,
    handleUpdate,
    handleDelete,
    handleGetDetail,
    handleReissueQr,
    handleToggleStatus
  };
}
