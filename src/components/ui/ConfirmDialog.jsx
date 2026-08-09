import { useEffect } from 'react';

export default function ConfirmDialog({
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="nidus-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="nidus-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nidus-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="nidus-confirm-title">{title}</h2>
        <div className="nidus-modal-body">{children}</div>
        <div className="nidus-modal-actions">
          <button type="button" className="home-btn ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className={`home-btn${danger ? ' danger' : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
