export function isPublicMediaUrl(value) {
  const url = String(value || '').trim();
  if (!url) return false;
  if (url.startsWith('blob:') || url.startsWith('file:')) return false;
  if (/^[a-zA-Z]:[\\/]/.test(url)) return false;
  if (url.startsWith('/uploads/')) return true;
  return /^https?:\/\//i.test(url);
}

export function publicMediaUrls(values, max = 8) {
  if (!Array.isArray(values)) return [];
  return values.filter(isPublicMediaUrl).slice(0, max);
}
