import { prisma } from './prisma.js';

export async function notify({ userId, actorId, type, entityId }) {
  if (!userId || userId === actorId) return null;
  return prisma.notification.create({
    data: {
      userId,
      actorId: actorId || null,
      type,
      entityId: entityId || null,
    },
  });
}
