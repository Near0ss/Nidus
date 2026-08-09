export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function normalizeUsername(username) {
  return String(username || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 24);
}

export function validateUsername(username) {
  return /^[a-zA-Z0-9._]{3,24}$/.test(normalizeUsername(username));
}

export function validatePassword(password) {
  return Boolean(password && String(password).length >= 6);
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateRegistrationData(data) {
  const errors = [];
  const username = normalizeUsername(data.username);

  if (!data.email || !validateEmail(data.email)) errors.push('Email inválido');
  if (!username || !validateUsername(username)) {
    errors.push('Username deve ter 3-20 caracteres (apenas letras, números e underscore)');
  }
  if (!data.password || !validatePassword(data.password)) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }
  if (!data.businessName || String(data.businessName).trim().length === 0) {
    errors.push('Nome do negócio é obrigatório');
  }
  if (!data.country || String(data.country).trim().length === 0) {
    errors.push('País é obrigatório');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateNormalUserData(data) {
  const errors = [];
  if (!data.name || String(data.name).trim().length === 0) errors.push('Nome é obrigatório');
  if (!data.email || !validateEmail(data.email)) errors.push('Email inválido');
  if (!data.password || !validatePassword(data.password)) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }
  if (data.username) {
    if (!validateUsername(normalizeUsername(data.username))) {
      errors.push('Username deve ter 3-24 caracteres (letras, números, ponto ou underscore)');
    }
  }
  return { isValid: errors.length === 0, errors };
}

export function sanitizeSocialLinks(links) {
  if (!links || typeof links !== 'object' || Array.isArray(links)) {
    return { instagram: '', twitter: '', linkedin: '', facebook: '' };
  }
  return {
    instagram: typeof links.instagram === 'string' ? links.instagram : '',
    twitter: typeof links.twitter === 'string' ? links.twitter : '',
    linkedin: typeof links.linkedin === 'string' ? links.linkedin : '',
    facebook: typeof links.facebook === 'string' ? links.facebook : '',
  };
}

export function pickAllowed(body, allowed) {
  const result = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
      result[key] = body[key];
    }
  }
  return result;
}
