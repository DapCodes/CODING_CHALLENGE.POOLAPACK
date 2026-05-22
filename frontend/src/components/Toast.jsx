import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
};

const colors = {
  success: { bg: '#ecfdf5', border: '#16a34a', text: '#15803d', shadow: '#16a34a' },
  error:   { bg: '#fef2f2', border: '#ef4444', text: '#dc2626', shadow: '#ef4444' },
  info:    { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8', shadow: '#2563eb' },
};

function ToastItem({ id, message, type, onRemove }) {
  const c = colors[type] || colors.info;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        background: c.bg,
        border: `2px solid ${c.border}`,
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: `4px 4px 0 ${c.shadow}`,
        color: c.text,
        fontWeight: 600,
        fontSize: '0.9rem',
        minWidth: '280px',
        maxWidth: '360px',
        animation: 'toastIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
        fontFamily: 'inherit',
      }}
    >
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.text,
          padding: 0,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null); // { message, resolve }

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirm({ message, resolve });
    });
  }, []);

  const handleConfirm = (result) => {
    if (confirm) confirm.resolve(result);
    setConfirm(null);
  };

  return (
    <ToastContext.Provider value={{ addToast, showConfirm }}>
      {children}

      {/* Toast stack */}
      {createPortal(
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          zIndex: 99999,
        }}>
          <style>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translateX(30px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          {toasts.map(t => (
            <ToastItem key={t.id} {...t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}

      {/* Confirm dialog */}
      {confirm && createPortal(
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99998,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out forwards',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #0f172a',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: '6px 6px 0 #0f172a',
            maxWidth: '400px',
            width: '100%',
            fontFamily: 'inherit',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
              <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{confirm.message}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleConfirm(false)}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#fff',
                  border: '2px solid #0f172a',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 #0f172a',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#ef4444',
                  border: '2px solid #0f172a',
                  borderRadius: '6px',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0 #0f172a',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
