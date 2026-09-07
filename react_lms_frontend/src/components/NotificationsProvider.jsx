import React, { useEffect, useState } from 'react';
import { onToast, onConfirm } from '../lib/notify';
import '../styles/index.css';

// Icônes inline, cohérentes avec le reste du design system.
const IconCheckCircle = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </svg>
);

const IconAlertCircle = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5" />
    <path d="M12 16h.01" />
  </svg>
);

const IconInfoCircle = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </svg>
);

const IconX = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconHelpCircle = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.6-1.35c.6.85.4 1.7-.4 2.35-.7.55-1.2 1-1.2 2" />
    <path d="M12 17h.01" />
  </svg>
);

const TOAST_ICONS = {
  success: IconCheckCircle,
  error: IconAlertCircle,
  info: IconInfoCircle,
};

function Toast({ toast, onDismiss }) {
  const type = toast.type === 'error' || toast.type === 'success' ? toast.type : 'info';
  const Icon = TOAST_ICONS[type];

  return (
    <div className={`lms-scope lms-toast lms-toast--${type}`} role="status">
      <Icon className="lms-toast__icon" />
      <span className="lms-toast__message">{toast.message}</span>
      <button className="lms-toast__close" onClick={onDismiss} aria-label="Fermer la notification">
        <IconX />
      </button>
    </div>
  );
}

export default function NotificationsProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    const unsub = onToast((t) => {
      setToasts((prev) => [...prev, t]);
      // auto remove after 6s
      setTimeout(() => setToasts((prev) => prev.filter((p) => p.id !== t.id)), 6000);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onConfirm((c) => setConfirmState(c));
    return unsub;
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {children}

      {/* Toast container */}
      <div className="lms-toast-stack">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div
          className="lms-scope lms-modal-overlay"
          onClick={() => { confirmState.resolve(false); setConfirmState(null); }}
        >
          <div className="lms-modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="lms-modal__icon">
              <IconHelpCircle />
            </div>
            <p className="lms-modal__message">{confirmState.message}</p>
            <div className="lms-modal__actions">
              <button
                className="lms-btn lms-btn--outline"
                onClick={() => { confirmState.resolve(false); setConfirmState(null); }}
              >
                Annuler
              </button>
              <button
                className="lms-btn lms-btn--primary"
                onClick={() => { confirmState.resolve(true); setConfirmState(null); }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
