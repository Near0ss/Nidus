export default function EmptyState({ title, children, actions, icon, className = '' }) {
  return (
    <div className={`nidus-empty${className ? ` ${className}` : ''}`}>
      {icon ? <div className="nidus-empty__icon" aria-hidden="true">{icon}</div> : null}
      {title ? <strong>{title}</strong> : null}
      {children ? <p>{children}</p> : null}
      {actions ? <div className="nidus-empty__actions">{actions}</div> : null}
    </div>
  );
}
