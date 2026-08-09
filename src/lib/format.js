export function formatBRL(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function priceLabel(service) {
  if (!service) return 'A combinar';
  if (service.priceType === 'NEGOTIABLE' || service.price == null) return 'A combinar';
  const money = formatBRL(service.price);
  if (service.priceType === 'STARTING_AT') return `A partir de ${money}`;
  return money;
}

export function deliveryLabel(days) {
  if (!days) return 'Prazo a combinar';
  if (Number(days) === 1) return '1 dia';
  return `${days} dias`;
}

export function locationLabel(item) {
  const parts = [item?.city, item?.state, item?.country].filter(Boolean);
  return parts.join(' · ') || '';
}

export function ratingLabel(rating, count) {
  if (!count) return 'Nenhuma avaliação ainda';
  const n = Number(rating).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${n} · ${count} avaliação${count === 1 ? '' : 'ões'}`;
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (diff < 45) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} d`;
  return new Date(value).toLocaleDateString('pt-BR');
}
