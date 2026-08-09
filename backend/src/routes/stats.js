import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { financeSummary } from '../lib/userQuery.js';
import { fromCents } from '../lib/money.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get('/stats', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const userId = req.auth.id;
  const [
    profileViews,
    serviceViews,
    hireClicks,
    messagesReceived,
    requests,
    accepted,
    completed,
    followers,
    likes,
    comments,
    posts,
    reviews,
    finance,
    topServices,
  ] = await Promise.all([
    prisma.profileView.count({ where: { profileId: userId } }),
    prisma.serviceView.count({ where: { service: { freelancerId: userId } } }),
    prisma.service.aggregate({ where: { freelancerId: userId }, _sum: { hireClicks: true } }),
    prisma.message.count({
      where: {
        senderId: { not: userId },
        conversation: { participants: { some: { userId } } },
      },
    }),
    prisma.contract.count({ where: { freelancerId: userId, status: 'REQUESTED' } }),
    prisma.contract.count({ where: { freelancerId: userId, status: { in: ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'] } } }),
    prisma.contract.count({ where: { freelancerId: userId, status: 'COMPLETED' } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.postLike.count({ where: { post: { authorId: userId } } }),
    prisma.comment.count({ where: { post: { authorId: userId } } }),
    prisma.post.count({ where: { authorId: userId } }),
    prisma.review.findMany({ where: { freelancerId: userId }, select: { rating: true } }),
    financeSummary(prisma, userId),
    prisma.service.findMany({
      where: { freelancerId: userId, status: { not: 'ARCHIVED' } },
      orderBy: { views: 'desc' },
      take: 5,
      select: { id: true, title: true, views: true, hireClicks: true },
    }),
  ]);

  const reviewCount = reviews.length;
  const rating = reviewCount
    ? Math.round((reviews.reduce((a, b) => a + b.rating, 0) / reviewCount) * 10) / 10
    : null;

  res.json({
    success: true,
    stats: {
      profileViews,
      serviceViews,
      hireClicks: hireClicks._sum.hireClicks || 0,
      messagesReceived,
      requestsReceived: requests,
      contractsAccepted: accepted,
      jobsCompleted: completed,
      revenue: fromCents(finance.completedCents) || 0,
      pendingRevenue: fromCents(finance.pendingCents) || 0,
      followers,
      likes,
      comments,
      posts,
      rating,
      reviewCount,
      topServices,
    },
  });
}));

router.get('/dashboard', authRequired, asyncHandler(async (req, res) => {
  const userId = req.auth.id;
  const role = req.auth.role || (req.auth.type === 'freelancer' ? 'FREELANCER' : 'CLIENT');

  if (role === 'CLIENT') {
    const [contracts, unreadMessages, unreadNotifications, saved] = await Promise.all([
      prisma.contract.findMany({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { freelancer: { include: { freelancerProfile: true } }, service: true },
      }),
      prisma.message.count({
        where: { readAt: null, senderId: { not: userId }, conversation: { participants: { some: { userId } } } },
      }),
      prisma.notification.count({ where: { userId, readAt: null } }),
      Promise.all([
        prisma.savedFreelancer.count({ where: { userId } }),
        prisma.savedService.count({ where: { userId } }),
        prisma.savedPost.count({ where: { userId } }),
      ]),
    ]);
    return res.json({
      success: true,
      role: 'CLIENT',
      summary: {
        requested: contracts.filter((c) => c.status === 'REQUESTED').length,
        inProgress: contracts.filter((c) => ['ACCEPTED', 'IN_PROGRESS'].includes(c.status)).length,
        delivered: contracts.filter((c) => c.status === 'DELIVERED').length,
        completed: contracts.filter((c) => c.status === 'COMPLETED').length,
        unreadMessages,
        unreadNotifications,
        saved: { freelancers: saved[0], services: saved[1], posts: saved[2] },
      },
      recentContracts: contracts,
    });
  }

  const [requests, active, delivered, completed, finance, unreadMessages, unreadNotifications, profileViews, reviews] = await Promise.all([
    prisma.contract.count({ where: { freelancerId: userId, status: 'REQUESTED' } }),
    prisma.contract.count({ where: { freelancerId: userId, status: { in: ['ACCEPTED', 'IN_PROGRESS'] } } }),
    prisma.contract.count({ where: { freelancerId: userId, status: 'DELIVERED' } }),
    prisma.contract.count({ where: { freelancerId: userId, status: 'COMPLETED' } }),
    financeSummary(prisma, userId),
    prisma.message.count({
      where: { readAt: null, senderId: { not: userId }, conversation: { participants: { some: { userId } } } },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
    prisma.profileView.count({ where: { profileId: userId } }),
    prisma.review.findMany({ where: { freelancerId: userId }, select: { rating: true } }),
  ]);

  const recent = await prisma.contract.findMany({
    where: { freelancerId: userId },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: { client: true, service: true },
  });

  const rating = reviews.length
    ? Math.round((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) * 10) / 10
    : null;

  res.json({
    success: true,
    role: 'FREELANCER',
    summary: {
      requests,
      active,
      delivered,
      completed,
      earnings: fromCents(finance.completedCents) || 0,
      pending: fromCents(finance.pendingCents) || 0,
      unreadMessages,
      unreadNotifications,
      profileViews,
      rating,
      reviewCount: reviews.length,
    },
    recent,
  });
}));

export default router;
