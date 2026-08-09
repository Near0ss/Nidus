export function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .slice(0, 24);
}

export function isValidUsername(value) {
  return /^[a-zA-Z0-9._]{3,24}$/.test(normalizeUsername(value));
}
