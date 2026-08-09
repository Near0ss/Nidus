import { randomUUID } from 'crypto';

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

export function uniqueSlug(value) {
  return `${slugify(value)}-${randomUUID().slice(0, 8)}`;
}
