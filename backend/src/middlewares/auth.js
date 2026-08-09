import { AUTH_COOKIE, verifyToken } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

export async function authOptional(req, _res, next) {
  try {
    let token = null;
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) token = header.slice(7).trim();
    else if (req.cookies?.[AUTH_COOKIE]) token = req.cookies[AUTH_COOKIE];
    if (!token) {
      req.auth = null;
      return next();
    }
    const payload = verifyToken(token);
    if (!payload?.id) {
      req.auth = null;
      return next();
    }
    req.auth = { id: payload.id, type: payload.type, role: payload.role };
    return next();
  } catch {
    req.auth = null;
    return next();
  }
}

export async function authRequired(req, res, next) {
  await authOptional(req, res, () => {});
  if (!req.auth?.id) {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado. Faça login para continuar.',
    });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.id) {
      return res.status(401).json({ success: false, message: 'Não autorizado.' });
    }
    const role = req.auth.role || (req.auth.type === 'freelancer' ? 'FREELANCER' : 'CLIENT');
    if (!roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para realizar esta ação.',
      });
    }
    next();
  };
}

export function assertOwner(req, res, id) {
  if (!req.auth || req.auth.id !== id) {
    res.status(403).json({
      success: false,
      message: 'Você não tem permissão para realizar esta ação.',
    });
    return false;
  }
  return true;
}

export async function loadAuthUser(req) {
  if (!req.auth?.id) return null;
  return prisma.user.findUnique({
    where: { id: req.auth.id },
    include: {
      freelancerProfile: { include: { skills: { include: { skill: true } } } },
    },
  });
}
