export const publicFreelancerInclude = {
  freelancerProfile: { include: { skills: { include: { skill: true } } } },
  servicesOwned: {
    where: { status: 'ACTIVE' },
    include: { media: true, category: true },
    orderBy: { createdAt: 'desc' },
  },
  portfolio: { include: { media: true }, orderBy: { createdAt: 'desc' } },
  posts: { include: { media: true }, orderBy: { createdAt: 'desc' }, take: 20 },
  reviewsReceived: { select: { rating: true } },
  _count: {
    select: {
      followers: true,
      follows: true,
      contractsAsFreelancer: { where: { status: 'COMPLETED' } },
    },
  },
};

export const privateUserInclude = {
  freelancerProfile: { include: { skills: { include: { skill: true } } } },
  servicesOwned: {
    include: { media: true, category: true },
    orderBy: { createdAt: 'desc' },
  },
  portfolio: { include: { media: true }, orderBy: { createdAt: 'desc' } },
  posts: { include: { media: true }, orderBy: { createdAt: 'desc' }, take: 20 },
  reviewsReceived: { select: { rating: true } },
  _count: {
    select: {
      followers: true,
      follows: true,
      contractsAsFreelancer: { where: { status: 'COMPLETED' } },
    },
  },
};

export async function financeSummary(prisma, userId) {
  const [completed, pending, active] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, status: 'COMPLETED', type: 'EARNING' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, status: 'PENDING' },
      _sum: { amount: true },
    }),
    prisma.contract.aggregate({
      where: {
        freelancerId: userId,
        status: { in: ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED'] },
      },
      _sum: { price: true },
    }),
  ]);

  return {
    completedCents: completed._sum.amount || 0,
    pendingCents: pending._sum.amount || 0,
    activeCents: active._sum.price || 0,
  };
}
