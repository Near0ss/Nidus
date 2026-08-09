import { Link } from 'react-router-dom';

export default function IconButton({
  to,
  icon,
  label,
  badge = 0,
  active = false,
  onClick,
  className = '',
}) {
  const count = Number(badge) || 0;
  const cls = `nidus-icon-btn${active ? ' is-active' : ''}${className ? ` ${className}` : ''}`;
  const content = (
    <>
      {icon}
      {count > 0 ? <span className="nidus-icon-btn__badge">{count > 9 ? '9+' : count}</span> : null}
      <span className="sr-only">{label}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} title={label} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} title={label} aria-label={label} onClick={onClick}>
      {content}
    </button>
  );
}
