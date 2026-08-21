import { useState } from 'react';
import { useAdminActivities } from '../../hooks/useAdminActivities';
import { ActivityTable } from '../../components/admin/ActivityTable';
import { ActivityModal } from '../../components/admin/ActivityModal';
import { AdminNavTabs } from '../../components/admin/AdminNavTabs';
import { useToast } from '../../hooks/useToast';
import { Waves, PlusCircle, RefreshCw } from 'lucide-react';

/**
 * ActivityManagerView Page
 * Administrative interface for viewing, adding, updating, and toggling
 * water sport activities and their pricing.
 */
export function ActivityManagerView() {
  const {
    activities,
    statusFilter,
    setStatusFilter,
    isLoading,
    fetchActivities,
    handleCreateActivity,
    handleUpdateActivity,
    handleToggleStatus
  } = useAdminActivities();

  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onOpenCreate = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const onOpenEdit = (act) => {
    setSelectedActivity(act);
    setIsModalOpen(true);
  };

  const onModalSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (selectedActivity && selectedActivity.id) {
        await handleUpdateActivity(selectedActivity.id, payload);
        toast.showSuccess(`Aktivitas ${payload.name} berhasil diperbarui.`);
      } else {
        await handleCreateActivity(payload);
        toast.showSuccess(`Aktivitas ${payload.name} berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      toast.showError(err.message || 'Gagal menyimpan data aktivitas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleStatusAction = async (activity, newStatus) => {
    try {
      await handleToggleStatus(activity, newStatus);
      toast.showSuccess(
        `Status aktivitas ${activity.name} diubah menjadi ${newStatus}.`
      );
    } catch (err) {
      toast.showError(err.message || 'Gagal memperbarui status aktivitas.');
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
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'var(--color-primary-600)' }}>
            <Waves size={24} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Supervisor
            </span>
          </div>
          <h1 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Katalog Aktivitas
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Kelola daftar aktivitas, tarif harga per pemakaian, dan ketersediaan operasional booth.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreate}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <PlusCircle size={16} /> Tambah Aktivitas
          </button>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <AdminNavTabs />

      {/* Filter Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Filter Status:
          </span>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.875rem', width: '180px', padding: '0.5rem 0.75rem' }}
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">ACTIVE (Tersedia)</option>
            <option value="INACTIVE">INACTIVE (Nonaktif)</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => fetchActivities()}
          disabled={isLoading}
          aria-label="Segarkan katalog"
          style={{ padding: '0.5rem' }}
        >
          <RefreshCw size={18} className={isLoading ? 'loading-spin' : ''} />
        </button>
      </div>

      {/* Activity Table */}
      {isLoading && activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <RefreshCw size={32} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Memuat katalog aktivitas...</p>
        </div>
      ) : (
        <ActivityTable
          activities={activities}
          onEdit={onOpenEdit}
          onToggleStatus={onToggleStatusAction}
        />
      )}

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        activity={selectedActivity}
        isSubmitting={isSubmitting}
        onSubmit={onModalSubmit}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActivity(null);
        }}
      />
    </div>
  );
}
