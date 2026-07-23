// Validation helper functions

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  // Username: 3-20 characters, alphanumeric and underscore
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password) {
  // Password: at least 6 characters
  return password && password.length >= 6;
}

export function validateRegistrationData(data) {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.username || !validateUsername(data.username)) {
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
