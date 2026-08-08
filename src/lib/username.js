export function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);
}

export function isValidUsername(value) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(normalizeUsername(value));
}
