import { useState } from 'react';
import { X, Waves, RefreshCw } from 'lucide-react';

/**
 * ActivityModal Component
 * Dialog for creating or editing a water sport activity.
 *
 * @param {{
 *   isOpen: boolean,
 *   activity?: Object|null,
 *   isSubmitting: boolean,
 *   onSubmit: (payload: { name: string, price: number, description?: string, status?: string }) => void,
 *   onClose: () => void
 * }} props
 */
export function ActivityModal({ isOpen, activity = null, isSubmitting, onSubmit, onClose }) {
  const isEditing = Boolean(activity && activity.id);

  const [name, setName] = useState(activity?.name || '');
  const [price, setPrice] = useState(activity?.price !== undefined ? activity.price : 150000);
  const [description, setDescription] = useState(activity?.description || '');
  const [status, setStatus] = useState(activity?.status || 'ACTIVE');
  const [prevActivityId, setPrevActivityId] = useState(activity?.id);

  // Sync state when editing a different activity
  if (activity?.id !== prevActivityId) {
    setPrevActivityId(activity?.id);
    setName(activity?.name || '');
    setPrice(activity?.price !== undefined ? activity.price : 150000);
    setDescription(activity?.description || '');
    setStatus(activity?.status || 'ACTIVE');
  }

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      price: Number(price) >= 0 ? Number(price) : 0,
      description: description.trim() ? description.trim() : undefined,
      status
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="sport-card"
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '480px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Waves size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {isEditing ? 'Edit Aktivitas Wahana' : 'Tambah Aktivitas Baru'}
            </h3>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Tutup"
            style={{ padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="activityName" className="form-label" style={{ fontWeight: 600 }}>
              Nama Aktivitas / Wahana *
            </label>
            <input
              id="activityName"
              type="text"
              className="form-input"
              placeholder="Contoh: Jet Ski, Banana Boat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              style={{ fontSize: '0.9375rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="activityPrice" className="form-label" style={{ fontWeight: 600 }}>
              Harga per Tiket / Pemakaian (IDR) *
            </label>
            <input
              id="activityPrice"
              type="number"
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="1000"
              required
              disabled={isSubmitting}
              style={{ fontSize: '0.9375rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="activityDesc" className="form-label" style={{ fontWeight: 600 }}>
              Deskripsi Singkat (Opsional)
            </label>
            <input
              id="activityDesc"
              type="text"
              className="form-input"
              placeholder="Contoh: Durasi 15 menit, termasuk pelampung"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              maxLength={255}
              style={{ fontSize: '0.9375rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="activityStatus" className="form-label" style={{ fontWeight: 600 }}>
              Status Operasional
            </label>
            <select
              id="activityStatus"
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isSubmitting}
              style={{ fontSize: '0.9375rem' }}
            >
              <option value="ACTIVE">ACTIVE (Tersedia untuk peserta & booth)</option>
              <option value="INACTIVE">INACTIVE (Disembunyikan / Tidak Beroperasi)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim() || Number(price) < 0}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="loading-spin" /> Menyimpan...
                </>
              ) : isEditing ? (
                'Simpan Perubahan'
              ) : (
                'Simpan Aktivitas'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
