import { Star } from 'lucide-react';

export default function Rating({ value = 0, count = 0, size = 14 }) {
  if (!count) {
    return (
      <span className="nidus-rating is-empty">
        <Star size={size} strokeWidth={1.75} aria-hidden="true" />
        Nenhuma avaliação ainda
      </span>
    );
  }
  const n = Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <span className="nidus-rating">
      <Star size={size} fill="currentColor" strokeWidth={1.75} aria-hidden="true" />
      {n} · {count}
    </span>
  );
}
