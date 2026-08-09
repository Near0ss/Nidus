import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializePublicUser, serializeService, serializePost } from '../lib/serialize.js';
import { publicFreelancerInclude } from '../lib/userQuery.js';
import { authOptional } from '../middlewares/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get('/search', authOptional, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    return res.json({ success: true, services: [], freelancers: [], posts: [], categories: [] });
  }

  const [services, freelancers, posts, categories] = await Promise.all([
    prisma.service.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { category: { name: { contains: q } } },
        ],
      },
      include: {
        media: true,
        category: true,
        freelancer: { include: { freelancerProfile: true, reviewsReceived: { select: { rating: true } } } },
      },
      take: 8,
    }),
    prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        OR: [
          { name: { contains: q } },
          { username: { contains: q } },
          { bio: { contains: q } },
          { freelancerProfile: { businessName: { contains: q } } },
        ],
      },
      include: publicFreelancerInclude,
      take: 8,
    }),
    prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: q } },
          { author: { OR: [{ name: { contains: q } }, { username: { contains: q } }] } },
        ],
      },
      include: {
        author: { include: { freelancerProfile: true } },
        media: true,
        _count: { select: { likes: true, comments: true } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { OR: [{ name: { contains: q } }, { slug: { contains: q.toLowerCase() } }] },
      take: 6,
    }),
  ]);

  res.json({
    success: true,
    services: services.map((s) => serializeService(s)),
    freelancers: freelancers.map((u) => serializePublicUser(u)),
    posts: posts.map((p) => serializePost(p, {
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    })),
    categories,
  });
}));

export default router;
