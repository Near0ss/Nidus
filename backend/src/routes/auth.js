import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  hashPassword,
  verifyPassword,
} from '../lib/auth.js';
import { serializePrivateUser } from '../lib/serialize.js';
import { financeSummary, privateUserInclude } from '../lib/userQuery.js';
import {
  normalizeEmail,
  normalizeUsername,
  validateRegistrationData,
  validateNormalUserData,
  validateUsername,
} from '../validators.js';
import { toCents } from '../lib/money.js';
import { asyncHandler, HttpError } from '../lib/errors.js';
import { authRequired } from '../middlewares/auth.js';

const router = Router();

async function checkTaken({ email, username }) {
  const emailNorm = email ? normalizeEmail(email) : '';
  const usernameNorm = username ? normalizeUsername(username) : '';
  const [emailUser, usernameUser] = await Promise.all([
    emailNorm ? prisma.user.findUnique({ where: { email: emailNorm }, select: { id: true } }) : null,
    usernameNorm ? prisma.user.findUnique({ where: { username: usernameNorm }, select: { id: true } }) : null,
  ]);
  return { emailTaken: Boolean(emailUser), usernameTaken: Boolean(usernameUser) };
}

async function privatePayload(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: privateUserInclude,
  });
  const [finance, savedCounts, unreadMessages, unreadNotifications] = await Promise.all([
    financeSummary(prisma, userId),
    Promise.all([
      prisma.savedFreelancer.count({ where: { userId } }),
      prisma.savedService.count({ where: { userId } }),
      prisma.savedPost.count({ where: { userId } }),
    ]).then(([freelancers, services, posts]) => ({ freelancers, services, posts })),
    prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: userId },
        conversation: { participants: { some: { userId } } },
      },
    }),
    prisma.notification.count({ where: { userId, readAt: null, type: { not: 'MESSAGE' } } }),
  ]);
  return serializePrivateUser(user, { finance, savedCounts, unreadMessages, unreadNotifications });
}

function slugFromEmail(email) {
  const base = String(email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 12) || 'user';
  return `${base}_${randomUUID().slice(0, 4)}`;
}

async function uniqueUsername(base) {
  let candidate = normalizeUsername(base) || slugFromEmail(base);
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${normalizeUsername(base).slice(0, 14)}_${randomUUID().slice(0, 4)}`;
  }
  return candidate;
}

router.get('/register/check', asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.query.email);
  const username = normalizeUsername(req.query.username);
  const taken = await checkTaken({ email, username });
  res.json({
    success: true,
    email: email || null,
    username: username || null,
    emailTaken: taken.emailTaken,
    usernameTaken: taken.usernameTaken,
    available: !taken.emailTaken && !taken.usernameTaken,
  });
}));

router.post('/register', asyncHandler(async (req, res) => {
  const password = req.body.password;
  const businessName = String(req.body.businessName || '').trim();
  const professionalTitle = req.body.professionalTitle;
  const bio = req.body.bio;
  const country = String(req.body.country || '').trim();
  const state = String(req.body.state || '').trim();
  const city = String(req.body.city || '').trim();
  const email = normalizeEmail(req.body.email);
  const username = normalizeUsername(req.body.username);
  const validation = validateRegistrationData({ ...req.body, email, username });
  if (!validation.isValid) {
    throw new HttpError(400, validation.errors.join('. '), { errors: validation.errors });
  }

  const taken = await checkTaken({ email, username });
  if (taken.emailTaken) throw new HttpError(409, 'Este e-mail já está cadastrado');
  if (taken.usernameTaken) throw new HttpError(409, 'Este username já está em uso');

  const passwordHash = await hashPassword(password);
  const titles = Array.isArray(professionalTitle) ? professionalTitle : [];

  const user = await prisma.user.create({
    data: {
      role: 'FREELANCER',
      name: businessName,
      username,
      email,
      passwordHash,
      bio: bio || '',
      country,
      state,
      city,
      freelancerProfile: {
        create: {
          businessName,
          about: bio || '',
          country,
          state,
          city,
          initialPrice: toCents(req.body.initialPrice),
          experience: String(req.body.experience || ''),
        },
      },
    },
  });

  if (titles.length) {
    for (const title of titles) {
      const name = String(title).trim();
      if (!name) continue;
      const skill = await prisma.skill.upsert({
        where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        update: {},
        create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || randomUUID().slice(0, 8) },
      });
      const profile = await prisma.freelancerProfile.findUnique({ where: { userId: user.id } });
      await prisma.freelancerSkill.upsert({
        where: { freelancerId_skillId: { freelancerId: profile.id, skillId: skill.id } },
        update: {},
        create: { freelancerId: profile.id, skillId: skill.id },
      });
    }
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({
    success: true,
    message: 'Freelancer cadastrado com sucesso',
    user: await privatePayload(user.id),
    token,
  });
}));

router.post('/register-user', asyncHandler(async (req, res) => {
  const { name, password, country, state } = req.body;
  const email = normalizeEmail(req.body.email);
  const requestedUsername = req.body.username ? normalizeUsername(req.body.username) : '';
  const validation = validateNormalUserData({ ...req.body, email, username: requestedUsername });
  if (!validation.isValid) {
    throw new HttpError(400, validation.errors.join('. '), { errors: validation.errors });
  }
  const username = requestedUsername && validateUsername(requestedUsername)
    ? requestedUsername
    : await uniqueUsername(email);
  const taken = await checkTaken({ email, username });
  if (taken.emailTaken) throw new HttpError(409, 'Este e-mail já está cadastrado');
  if (taken.usernameTaken) throw new HttpError(409, 'Este username já está em uso');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      role: 'CLIENT',
      name: String(name).trim(),
      username,
      email,
      passwordHash,
      country: country || '',
      state: state || '',
    },
  });

  const token = signToken(user);
  setAuthCookie(res, token);
  res.status(201).json({
    success: true,
    message: 'Usuário cadastrado com sucesso',
    user: await privatePayload(user.id),
    token,
  });
}));

function normalizeIntendedRole(value) {
  const raw = String(value || '').toUpperCase();
  if (raw === 'FREELANCER' || raw === 'CLIENT') return raw;
  if (raw === 'NORMAL' || raw === 'USUARIO' || raw === 'USER') return 'CLIENT';
  return null;
}

router.post('/login', asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const intendedRole = normalizeIntendedRole(req.body.intendedRole);
  if (!password || (!email && !username)) {
    throw new HttpError(400, 'E-mail/usuário e senha são obrigatórios');
  }

  const emailNorm = email ? normalizeEmail(email) : '';
  const usernameNorm = username ? normalizeUsername(username) : '';
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        emailNorm ? { email: emailNorm } : undefined,
        usernameNorm ? { username: usernameNorm } : undefined,
        emailNorm ? { username: normalizeUsername(email) } : undefined,
      ].filter(Boolean),
    },
  });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Credenciais inválidas');
  }

  const { ok, needsRehash } = await verifyPassword(user.passwordHash, password);
  if (!ok) throw new HttpError(401, 'Credenciais inválidas');

  if (needsRehash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    });
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  const roleMismatch = Boolean(intendedRole && user.role !== intendedRole);
  res.json({
    success: true,
    message: roleMismatch
      ? `Esta conta está cadastrada como ${user.role === 'FREELANCER' ? 'freelancer' : 'cliente'}.`
      : 'Login realizado com sucesso',
    user: await privatePayload(user.id),
    token,
    roleMismatch,
  });
}));

router.post('/login/google', asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.body.token;
  if (!accessToken) throw new HttpError(400, 'Token do Google ausente');

  const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!googleRes.ok) throw new HttpError(401, 'Não foi possível validar o Google');
  const info = await googleRes.json();
  const email = normalizeEmail(info.email);
  const googleId = info.sub || info.id;
  if (!email || !googleId) throw new HttpError(401, 'Conta Google sem e-mail');

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    if (!user.googleId) {
      await prisma.user.update({ where: { id: user.id }, data: { googleId, provider: user.provider || 'google' } });
    }
    const token = signToken(user);
    setAuthCookie(res, token);
    return res.json({
      success: true,
      message: 'Login com Google realizado',
      user: await privatePayload(user.id),
      token,
    });
  }

  res.json({
    success: true,
    needsRole: true,
    profile: {
      name: info.name || email.split('@')[0],
      email,
      picture: info.picture || '',
    },
  });
}));

router.post('/login/google/complete', asyncHandler(async (req, res) => {
  const accessToken = req.body.accessToken || req.body.token;
  const role = normalizeIntendedRole(req.body.role);
  if (!accessToken) throw new HttpError(400, 'Token do Google ausente');
  if (!role) throw new HttpError(400, 'Escolha como você pretende usar o Nidus');

  const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!googleRes.ok) throw new HttpError(401, 'Não foi possível validar o Google');
  const info = await googleRes.json();
  const email = normalizeEmail(info.email);
  const googleId = info.sub || info.id;
  if (!email || !googleId) throw new HttpError(401, 'Conta Google sem e-mail');

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (user) {
    if (!user.googleId) {
      await prisma.user.update({ where: { id: user.id }, data: { googleId, provider: user.provider || 'google' } });
    }
  } else {
    const name = info.name || email.split('@')[0];
    user = await prisma.user.create({
      data: {
        role,
        name,
        username: await uniqueUsername(info.name || email),
        email,
        googleId,
        provider: 'google',
        avatarUrl: info.picture || '',
        freelancerProfile: role === 'FREELANCER'
          ? { create: { businessName: name, about: '' } }
          : undefined,
      },
    });
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  res.json({
    success: true,
    message: 'Login com Google realizado',
    user: await privatePayload(user.id),
    token,
  });
}));

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Sessão encerrada' });
});

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await privatePayload(req.auth.id);
  if (!user) throw new HttpError(401, 'Usuário não encontrado');
  res.json({ success: true, user });
}));

export default router;
export { privatePayload };
