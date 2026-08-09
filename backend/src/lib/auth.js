import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const AUTH_COOKIE = 'nidus_token';
export const TOKEN_EXPIRES_IN = '7d';
export const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const BCRYPT_ROUNDS = 10;

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET é obrigatório em produção');
  }
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  if (process.env.NODE_ENV === 'production' && secret === 'nidus-dev-secret-change-me') {
    throw new Error('JWT_SECRET de desenvolvimento não pode ser usado em produção');
  }
  return secret;
}

export function roleToType(role) {
  return role === 'FREELANCER' ? 'freelancer' : 'normal';
}

export function typeToRole(type) {
  return type === 'freelancer' || type === 'FREELANCER' ? 'FREELANCER' : 'CLIENT';
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, type: roleToType(user.role), role: user.role },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRES_IN },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_MAX_AGE_MS,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
}

export function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(storedHash, plain) {
  if (!storedHash) return { ok: false, needsRehash: false };
  if (isBcryptHash(storedHash)) {
    return { ok: await bcrypt.compare(plain, storedHash), needsRehash: false };
  }
  const ok = storedHash === plain;
  return { ok, needsRehash: ok };
}
