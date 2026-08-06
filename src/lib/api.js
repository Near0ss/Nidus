export async function apiFetch(path, options = {}) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição');
  }

  return data;
}
