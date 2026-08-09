import { useState } from 'react';

function initialsFrom(name) {
  const parts = String(name || 'N')
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  const compact = (parts[0] || 'N').replace(/[^A-Za-z0-9]/g, '');
  if (compact.length >= 2) return compact.slice(0, 2).toUpperCase();
  return (compact[0] || 'N').toUpperCase();
}

export default function UserAvatar({ src, name, size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;
  const fontSize = Math.max(12, Math.min(28, Math.round(size * 0.36)));

  return (
    <span
      className={`nidus-avatar${showImg ? '' : ' is-fallback'}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, fontSize }}
    >
      {showImg ? (
        <img src={src} alt={name ? `Foto de ${name}` : ''} onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initialsFrom(name)}</span>
      )}
    </span>
  );
}
