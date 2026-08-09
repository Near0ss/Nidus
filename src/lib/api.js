export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Rode o backend na porta 5000.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    throw new Error(data.message || `Erro na requisição (${response.status})`);
  }

  return data;
}

export async function uploadFiles(files) {
  const form = new FormData();
  [...files].forEach((file) => form.append('files', file));
  return apiFetch('/api/uploads', { method: 'POST', body: form });
}
