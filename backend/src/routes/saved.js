import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializePublicUser, serializeService, serializePost } from '../lib/serialize.js';
import { publicFreelancerInclude } from '../lib/userQuery.js';
import { authRequired } from '../middlewares/auth.js';
import { asyncHandler, HttpError } from '../lib/errors.js';

const router = Router();

router.get('/saved', authRequired, asyncHandler(async (req, res) => {
  const [freelancers, services, posts] = await Promise.all([
    prisma.savedFreelancer.findMany({
      where: { userId: req.auth.id },
      include: { freelancer: { include: publicFreelancerInclude } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.savedService.findMany({
      where: { userId: req.auth.id },
      include: {
        service: {
          include: {
            media: true,
            category: true,
            freelancer: { include: { freelancerProfile: true, reviewsReceived: { select: { rating: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.savedPost.findMany({
      where: { userId: req.auth.id },
      include: {
        post: {
          include: {
            author: { include: { freelancerProfile: true } },
            media: true,
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.json({
    success: true,
    users: freelancers.map((item) => serializePublicUser(item.freelancer, { saved: true })),
    freelancers: freelancers.map((item) => serializePublicUser(item.freelancer, { saved: true })),
    services: services.map((item) => serializeService(item.service, { saved: true })),
    posts: posts.map((item) => serializePost(item.post, {
      likeCount: item.post._count?.likes || 0,
      commentCount: item.post._count?.comments || 0,
      saved: true,
    })),
  });
}));

router.post('/saved/:id', authRequired, asyncHandler(async (req, res) => {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || target.role !== 'FREELANCER') throw new HttpError(404, 'Freelancer não encontrado');
  const existing = await prisma.savedFreelancer.findUnique({
    where: { userId_freelancerId: { userId: req.auth.id, freelancerId: target.id } },
  });
  if (existing) {
    await prisma.savedFreelancer.delete({
      where: { userId_freelancerId: { userId: req.auth.id, freelancerId: target.id } },
    });
  } else {
    await prisma.savedFreelancer.create({ data: { userId: req.auth.id, freelancerId: target.id } });
  }
  res.json({ success: true, saved: !existing });
}));

router.post('/saved/services/:id', authRequired, asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!service) throw new HttpError(404, 'Serviço não encontrado');
  const existing = await prisma.savedService.findUnique({
    where: { userId_serviceId: { userId: req.auth.id, serviceId: service.id } },
  });
  if (existing) {
    await prisma.savedService.delete({
      where: { userId_serviceId: { userId: req.auth.id, serviceId: service.id } },
    });
  } else {
    await prisma.savedService.create({ data: { userId: req.auth.id, serviceId: service.id } });
  }
  res.json({ success: true, saved: !existing });
}));

export default router;
