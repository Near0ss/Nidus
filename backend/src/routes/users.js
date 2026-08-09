import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializePublicUser } from '../lib/serialize.js';
import { privateUserInclude, publicFreelancerInclude } from '../lib/userQuery.js';
import { authOptional, authRequired, assertOwner } from '../middlewares/auth.js';
import { pickAllowed, sanitizeSocialLinks, normalizeEmail, normalizeUsername, validateEmail } from '../validators.js';
import { toCents } from '../lib/money.js';
import { asyncHandler, HttpError } from '../lib/errors.js';
import { privatePayload } from './auth.js';

const router = Router();

const FREELANCER_FIELDS = [
  'email', 'username', 'businessName', 'professionalTitle', 'bio', 'country', 'state', 'city',
  'website', 'profilePhoto', 'banner', 'socialLinks', 'availability', 'experience', 'initialPrice',
];
const CLIENT_FIELDS = [
  'name', 'email', 'country', 'state', 'city', 'profilePhoto', 'banner', 'bio', 'company',
  'website', 'phone', 'hiringFocus', 'socialLinks',
];

router.get('/users', asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'FREELANCER' },
    include: publicFreelancerInclude,
    orderBy: { createdAt: 'desc' },
  });
  res.json({
    success: true,
    users: users.map((user) => serializePublicUser(user)),
  });
}));

router.get('/u/:username', authOptional, asyncHandler(async (req, res) => {
  const username = normalizeUsername(req.params.username);
  const user = await prisma.user.findUnique({
    where: { username },
    include: publicFreelancerInclude,
  });
  if (!user) throw new HttpError(404, 'Perfil não encontrado');

  if (user.role === 'FREELANCER' && req.auth?.id !== user.id) {
    await prisma.freelancerProfile.updateMany({
      where: { userId: user.id },
      data: { profileViews: { increment: 1 } },
    });
    await prisma.profileView.create({
      data: { profileId: user.id, viewerId: req.auth?.id || null },
    });
  }

  const extras = {};
  if (req.auth?.id) {
    extras.isFollowing = Boolean(await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.auth.id, followingId: user.id } },
    }));
    extras.saved = Boolean(await prisma.savedFreelancer.findUnique({
      where: { userId_freelancerId: { userId: req.auth.id, freelancerId: user.id } },
    }));
  }

  res.json({ success: true, user: serializePublicUser(user, extras) });
}));

router.get('/users/:id', authOptional, asyncHandler(async (req, res) => {
  const isOwner = req.auth?.id === req.params.id;
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: isOwner ? privateUserInclude : publicFreelancerInclude,
  });
  if (!user) throw new HttpError(404, 'Usuário não encontrado');

  if (isOwner) {
    return res.json({ success: true, user: await privatePayload(user.id) });
  }
  res.json({ success: true, user: serializePublicUser(user) });
}));

router.put('/users/:id', authRequired, asyncHandler(async (req, res) => {
  if (!assertOwner(req, res, req.params.id)) return;
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { freelancerProfile: true },
  });
  if (!user) throw new HttpError(404, 'Usuário não encontrado');

  const allowed = user.role === 'FREELANCER' ? FREELANCER_FIELDS : CLIENT_FIELDS;
  const body = pickAllowed(req.body, allowed);

  if (body.email) {
    const email = normalizeEmail(body.email);
    if (!validateEmail(email)) throw new HttpError(400, 'Email inválido');
    const exists = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } } });
    if (exists) throw new HttpError(409, 'Este e-mail já está cadastrado');
    body.email = email;
  }
  if (body.username) {
    const username = normalizeUsername(body.username);
    const exists = await prisma.user.findFirst({ where: { username, NOT: { id: user.id } } });
    if (exists) throw new HttpError(409, 'Este username já está em uso');
    body.username = username;
  }

  const userData = {};
  if (body.name) userData.name = String(body.name).trim();
  if (body.email) userData.email = body.email;
  if (body.username) userData.username = body.username;
  if (body.bio !== undefined) userData.bio = String(body.bio || '');
  if (body.country !== undefined) userData.country = String(body.country || '');
  if (body.state !== undefined) userData.state = String(body.state || '');
  if (body.city !== undefined) userData.city = String(body.city || '');
  if (body.website !== undefined) userData.website = String(body.website || '');
  if (body.phone !== undefined) userData.phone = String(body.phone || '');
  if (body.company !== undefined) userData.company = String(body.company || '');
  if (body.hiringFocus !== undefined) userData.hiringFocus = String(body.hiringFocus || '');
  if (body.profilePhoto !== undefined) userData.avatarUrl = String(body.profilePhoto || '');
  if (body.banner !== undefined) userData.bannerUrl = String(body.banner || '');
  if (body.socialLinks) userData.socialLinks = JSON.stringify(sanitizeSocialLinks(body.socialLinks));
  if (body.businessName && user.role === 'FREELANCER') userData.name = String(body.businessName).trim();

  await prisma.user.update({ where: { id: user.id }, data: userData });

  if (user.role === 'FREELANCER' && user.freelancerProfile) {
    const availMap = {
      disponível: 'AVAILABLE',
      disponivel: 'AVAILABLE',
      available: 'AVAILABLE',
      ocupado: 'BUSY',
      busy: 'BUSY',
      indisponível: 'UNAVAILABLE',
      indisponivel: 'UNAVAILABLE',
      unavailable: 'UNAVAILABLE',
    };
    const availabilityRaw = String(body.availability || '').trim().toLowerCase();
    await prisma.freelancerProfile.update({
      where: { id: user.freelancerProfile.id },
      data: {
        businessName: body.businessName !== undefined ? String(body.businessName).trim() : undefined,
        about: body.bio !== undefined ? String(body.bio || '') : undefined,
        experience: body.experience !== undefined ? String(body.experience || '') : undefined,
        country: body.country !== undefined ? String(body.country || '') : undefined,
        state: body.state !== undefined ? String(body.state || '') : undefined,
        city: body.city !== undefined ? String(body.city || '') : undefined,
        initialPrice: body.initialPrice !== undefined ? toCents(body.initialPrice) : undefined,
        availability: availabilityRaw ? (availMap[availabilityRaw] || user.freelancerProfile.availability) : undefined,
      },
    });

    if (Array.isArray(body.professionalTitle)) {
      await prisma.freelancerSkill.deleteMany({ where: { freelancerId: user.freelancerProfile.id } });
      for (const title of body.professionalTitle) {
        const name = String(title).trim();
        if (!name) continue;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || name;
        const skill = await prisma.skill.upsert({
          where: { slug },
          update: { name },
          create: { name, slug },
        });
        await prisma.freelancerSkill.create({
          data: { freelancerId: user.freelancerProfile.id, skillId: skill.id },
        });
      }
    }
  }

  res.json({ success: true, user: await privatePayload(user.id) });
}));

router.delete('/users/:id', authRequired, asyncHandler(async (req, res) => {
  if (!assertOwner(req, res, req.params.id)) return;
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Conta excluída' });
}));

export default router;
