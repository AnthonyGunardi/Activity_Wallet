import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={20} color="#10b981" />,
  error: <AlertCircle size={20} color="#ef4444" />,
  warning: <AlertTriangle size={20} color="#f59e0b" />,
  info: <Info size={20} color="#0ea5e9" />
};

/**
 * High contrast outdoor toast notification item
 */
export const ToastItem = ({ toast, onDismiss }) => {
  const { id, type = 'info', message } = toast;

  return (
    <div
      role="alert"
      data-testid={`toast-${id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        borderRadius: '0.625rem',
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid #334155',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
        minWidth: '280px',
        maxWidth: '420px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div style={{ flexShrink: 0 }}>{icons[type] || icons.info}</div>
      <div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500 }}>{message}</div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Tutup notifikasi"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.25rem'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
