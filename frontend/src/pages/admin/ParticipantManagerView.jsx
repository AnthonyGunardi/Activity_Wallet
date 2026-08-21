import { useState } from 'react';
import { useAdminParticipants } from '../../hooks/useAdminParticipants';
import { ParticipantTable } from '../../components/admin/ParticipantTable';
import { ParticipantModal } from '../../components/admin/ParticipantModal';
import { ParticipantDetailModal } from '../../components/admin/ParticipantDetailModal';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { BulkImportModal } from '../../components/admin/BulkImportModal';
import { ReissueQRModal } from '../../components/admin/ReissueQRModal';
import { AdminNavTabs } from '../../components/admin/AdminNavTabs';
import { useToast } from '../../hooks/useToast';
import { Users, UserPlus, FileSpreadsheet, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export function ParticipantManagerView() {
  const {
    participants,
    pagination,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isLoading,
    fetchParticipants,
    handleCreate,
    handleBulkCreate,
    handleUpdate,
    handleDelete,
    handleGetDetail,
    handleReissueQr,
    handleToggleStatus
  } = useAdminParticipants();

  const toast = useToast();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedParticipantForEdit, setSelectedParticipantForEdit] = useState(null);
  const [selectedParticipantForDetail, setSelectedParticipantForDetail] = useState(null);
  const [selectedParticipantForDelete, setSelectedParticipantForDelete] = useState(null);
  const [selectedParticipantForReissue, setSelectedParticipantForReissue] = useState(null);
  const [reissueResult, setReissueResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCreateSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await handleCreate(payload);
      toast.showSuccess(`Peserta ${payload.name} berhasil ditambahkan.`);
      setIsAddModalOpen(false);
    } catch (err) {
      toast.showError(err.message || 'Gagal menambahkan peserta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (payload) => {
    if (!selectedParticipantForEdit) return;
    setIsSubmitting(true);
    try {
      await handleUpdate(selectedParticipantForEdit.id, payload);
      toast.showSuccess(`Data peserta ${payload.name || selectedParticipantForEdit.name} berhasil diperbarui.`);
      setSelectedParticipantForEdit(null);
    } catch (err) {
      toast.showError(err.message || 'Gagal memperbarui data peserta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async (participantId) => {
    setIsSubmitting(true);
    try {
      await handleDelete(participantId);
      toast.showSuccess('Data peserta berhasil dihapus.');
      setSelectedParticipantForDelete(null);
    } catch (err) {
      toast.showError(err.message || 'Gagal menghapus peserta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBulkSubmit = async (list) => {
    setIsSubmitting(true);
    try {
      const result = await handleBulkCreate(list);
      toast.showSuccess(`Berhasil mengimpor ${result.created_count || list.length} peserta.`);
      setIsBulkModalOpen(false);
    } catch (err) {
      toast.showError(err.message || 'Gagal mengimpor peserta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReissueConfirm = async (participantId) => {
    setIsSubmitting(true);
    try {
      const result = await handleReissueQr(participantId);
      setReissueResult(result);
      toast.showSuccess(`Kode QR berhasil diperbarui menjadi ${result.new_qr_code}.`);
    } catch (err) {
      toast.showError(err.message || 'Gagal mereissue QR peserta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleStatusAction = async (participant, newStatus) => {
    try {
      await handleToggleStatus(participant, newStatus);
      toast.showSuccess(
        `Status peserta ${participant.name} diubah menjadi ${newStatus}.`
      );
    } catch (err) {
      toast.showError(err.message || 'Gagal memperbarui status peserta.');
    }
  };

  return (
    <div className="app-container" style={{ padding: '2rem 1rem 3rem 1rem', maxWidth: '1200px', margin: '0 auto', flex: 1 }}>
      {/* Header section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-primary-600)' }}>
            <Users size={24} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Activity Admin
            </span>
          </div>
          <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Manajemen Peserta & QR
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Kelola data peserta, kredit aktivitas, status QR, dan riwayat transaksi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsBulkModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <FileSpreadsheet size={16} /> Impor Data Peserta (Excel)
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <UserPlus size={16} /> Tambah Peserta
          </button>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <AdminNavTabs />

      {/* Filter and Search Bar */}
      <div
        className="sport-card"
        style={{
          background: 'var(--color-bg-surface)',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-dim)'
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Cari berdasarkan nama atau kode peserta"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.875rem', width: '160px', padding: '0.5rem 0.75rem' }}
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => fetchParticipants(pagination.page)}
            disabled={isLoading}
            aria-label="Segarkan data"
            style={{ padding: '0.5rem' }}
          >
            <RefreshCw size={18} className={isLoading ? 'loading-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Participants Table */}
      {isLoading && participants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <RefreshCw size={32} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Memuat data peserta...</p>
        </div>
      ) : (
        <ParticipantTable
          participants={participants}
          onViewDetail={(p) => setSelectedParticipantForDetail(p)}
          onEdit={(p) => setSelectedParticipantForEdit(p)}
          onDelete={(p) => setSelectedParticipantForDelete(p)}
          onReissue={(p) => {
            setSelectedParticipantForReissue(p);
            setReissueResult(null);
          }}
          onToggleStatus={onToggleStatusAction}
        />
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            padding: '0.5rem 0'
          }}
        >
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Menampilkan halaman <strong>{pagination.page}</strong> dari{' '}
            <strong>{pagination.totalPages}</strong> ({pagination.total} peserta)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => fetchParticipants(pagination.page - 1)}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => fetchParticipants(pagination.page + 1)}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Tambah Peserta Baru */}
      <ParticipantModal
        isOpen={isAddModalOpen}
        isSubmitting={isSubmitting}
        onSubmit={onCreateSubmit}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Modal: Edit Data Peserta */}
      <ParticipantModal
        isOpen={Boolean(selectedParticipantForEdit)}
        isSubmitting={isSubmitting}
        participant={selectedParticipantForEdit}
        onSubmit={onEditSubmit}
        onClose={() => setSelectedParticipantForEdit(null)}
      />

      {/* Modal: Detail Peserta & Riwayat Transaksi */}
      <ParticipantDetailModal
        isOpen={Boolean(selectedParticipantForDetail)}
        participantId={selectedParticipantForDetail?.id}
        fetchDetail={handleGetDetail}
        onClose={() => setSelectedParticipantForDetail(null)}
      />

      {/* Modal: Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedParticipantForDelete)}
        participant={selectedParticipantForDelete}
        isSubmitting={isSubmitting}
        onConfirm={onDeleteConfirm}
        onClose={() => setSelectedParticipantForDelete(null)}
      />

      {/* Modal: Bulk Import */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        isSubmitting={isSubmitting}
        onSubmit={onBulkSubmit}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Modal: Reissue QR */}
      <ReissueQRModal
        isOpen={Boolean(selectedParticipantForReissue)}
        participant={selectedParticipantForReissue}
        reissueResult={reissueResult}
        isSubmitting={isSubmitting}
        onConfirm={onReissueConfirm}
        onClose={() => {
          setSelectedParticipantForReissue(null);
          setReissueResult(null);
        }}
      />
    </div>
  );
}
