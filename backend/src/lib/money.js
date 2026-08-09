export function toCents(value) {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function fromCents(cents) {
  if (cents == null) return null;
  return Number(cents) / 100;
}

export function formatBRL(cents) {
  if (cents == null) return null;
  return Number(cents).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
