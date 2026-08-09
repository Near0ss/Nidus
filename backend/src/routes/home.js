import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializePublicUser, serializeService, serializePost } from '../lib/serialize.js';
import { publicFreelancerInclude } from '../lib/userQuery.js';
import { authOptional } from '../middlewares/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get('/home', authOptional, asyncHandler(async (req, res) => {
  const city = req.auth?.id
    ? (await prisma.user.findUnique({ where: { id: req.auth.id }, select: { city: true, state: true } }))
    : null;

  const [featuredServices, newServices, freelancers, posts, categories] = await Promise.all([
    prisma.service.findMany({
      where: { status: 'ACTIVE' },
      include: {
        media: true,
        category: true,
        freelancer: { include: { freelancerProfile: true, reviewsReceived: { select: { rating: true } } } },
      },
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    }),
    prisma.service.findMany({
      where: { status: 'ACTIVE' },
      include: {
        media: true,
        category: true,
        freelancer: { include: { freelancerProfile: true, reviewsReceived: { select: { rating: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.user.findMany({
      where: { role: 'FREELANCER' },
      include: publicFreelancerInclude,
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.post.findMany({
      include: {
        author: { include: { freelancerProfile: true } },
        media: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.category.findMany({
      include: { _count: { select: { services: { where: { status: 'ACTIVE' } } } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  let nearby = [];
  if (city?.city || city?.state) {
    nearby = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        OR: [
          city.city ? { city: { contains: city.city } } : undefined,
          city.state ? { state: { contains: city.state } } : undefined,
        ].filter(Boolean),
      },
      include: publicFreelancerInclude,
      take: 6,
    });
  }

  res.json({
    success: true,
    featuredServices: featuredServices.map((s) => serializeService(s)),
    newServices: newServices.map((s) => serializeService(s)),
    freelancers: freelancers.map((u) => serializePublicUser(u)),
    nearbyFreelancers: nearby.map((u) => serializePublicUser(u)),
    posts: posts.map((p) => serializePost(p, {
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    })),
    categories: categories
      .filter((c) => c._count.services > 0)
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug, serviceCount: c._count.services })),
  });
}));

export default router;
