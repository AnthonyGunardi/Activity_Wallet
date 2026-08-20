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
      className="toast-item"
    >
      <div style={{ flexShrink: 0 }}>{icons[type] || icons.info}</div>
      <div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500, wordBreak: 'break-word' }}>{message}</div>
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
          padding: '0.25rem',
          flexShrink: 0
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
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
