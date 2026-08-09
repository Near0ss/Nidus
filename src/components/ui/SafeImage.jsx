import { useState } from 'react';

export default function SafeImage({
  src,
  alt = '',
  fallback,
  className = '',
  loading = 'lazy',
}) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const primary = src && !failed ? src : null;
  const secondary = fallback && !fallbackFailed ? fallback : null;
  const current = primary || secondary;

  if (!current) {
    return (
      <span className={`nidus-img-fallback ${className}`} role="img" aria-label={alt || 'Sem imagem'}>
        <span>Sem imagem</span>
      </span>
    );
  }

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (primary) setFailed(true);
        else setFallbackFailed(true);
      }}
    />
  );
}
