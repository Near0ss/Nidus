import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializePublicUser } from '../lib/serialize.js';
import { publicFreelancerInclude } from '../lib/userQuery.js';
import { authOptional } from '../middlewares/auth.js';
import { toCents } from '../lib/money.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get('/freelancers', authOptional, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const skill = String(req.query.skill || '').trim();
  const city = String(req.query.city || '').trim();
  const state = String(req.query.state || '').trim();
  const availability = String(req.query.availability || '').trim().toUpperCase();
  const minPrice = toCents(req.query.minPrice);
  const maxPrice = toCents(req.query.maxPrice);
  const minRating = req.query.minRating ? Number(req.query.minRating) : null;

  const where = { role: 'FREELANCER' };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { username: { contains: q } },
      { bio: { contains: q } },
      { freelancerProfile: { businessName: { contains: q }, headline: { contains: q } } },
    ];
  }
  const profileWhere = {};
  if (city) profileWhere.city = { contains: city };
  if (state) profileWhere.state = { contains: state };
  if (['AVAILABLE', 'BUSY', 'UNAVAILABLE'].includes(availability)) {
    profileWhere.availability = availability;
  }
  if (minPrice != null || maxPrice != null) {
    profileWhere.initialPrice = {};
    if (minPrice != null) profileWhere.initialPrice.gte = minPrice;
    if (maxPrice != null) profileWhere.initialPrice.lte = maxPrice;
  }
  if (skill || category) {
    profileWhere.skills = {
      some: {
        skill: {
          OR: [
            skill ? { name: { contains: skill } } : undefined,
            skill ? { slug: { contains: skill.toLowerCase() } } : undefined,
            category ? { category: { name: { contains: category } } } : undefined,
            category ? { category: { slug: category } } : undefined,
          ].filter(Boolean),
        },
      },
    };
  }
  if (Object.keys(profileWhere).length) where.freelancerProfile = profileWhere;

  const users = await prisma.user.findMany({
    where,
    include: publicFreelancerInclude,
    take: 60,
    orderBy: { createdAt: 'desc' },
  });

  let list = users;
  if (minRating) {
    list = users.filter((user) => {
      const reviews = user.reviewsReceived || [];
      if (!reviews.length) return false;
      const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
      return avg >= minRating;
    });
  }

  let savedIds = new Set();
  let followingIds = new Set();
  if (req.auth?.id) {
    const [saved, follows] = await Promise.all([
      prisma.savedFreelancer.findMany({
        where: { userId: req.auth.id, freelancerId: { in: list.map((u) => u.id) } },
        select: { freelancerId: true },
      }),
      prisma.follow.findMany({
        where: { followerId: req.auth.id, followingId: { in: list.map((u) => u.id) } },
        select: { followingId: true },
      }),
    ]);
    savedIds = new Set(saved.map((s) => s.freelancerId));
    followingIds = new Set(follows.map((f) => f.followingId));
  }

  res.json({
    success: true,
    freelancers: list.map((user) => serializePublicUser(user, {
      saved: savedIds.has(user.id),
      isFollowing: followingIds.has(user.id),
    })),
  });
}));

router.get('/categories', asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { services: { where: { status: 'ACTIVE' } } } }, skills: true },
    orderBy: { name: 'asc' },
  });
  res.json({
    success: true,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      serviceCount: c._count.services,
      skills: c.skills.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
    })),
  });
}));

export default router;
