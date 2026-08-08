// Validation helper functions

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);
}

export function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(normalizeUsername(username));
}

export function validatePassword(password) {
  // Password: at least 6 characters
  return password && password.length >= 6;
}

export function validateRegistrationData(data) {
  const errors = [];
  const username = normalizeUsername(data.username);

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!username || !validateUsername(username)) {
    errors.push('Username deve ter 3-20 caracteres (apenas letras, números e underscore)');
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  if (!data.businessName || data.businessName.trim().length === 0) {
    errors.push('Nome do negócio é obrigatório');
  }

  if (!data.country || data.country.trim().length === 0) {
    errors.push('País é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateNormalUserData(data) {
  const errors = [];

  if (!data.name || String(data.name).trim().length === 0) {
    errors.push('Nome é obrigatório');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push('Senha deve ter no mínimo 6 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
