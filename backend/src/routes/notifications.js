import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeNotification } from '../lib/serialize.js';
import { authRequired } from '../middlewares/auth.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get('/notifications', authRequired, asyncHandler(async (req, res) => {
  const items = await prisma.notification.findMany({
    where: { userId: req.auth.id },
    include: { actor: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.auth.id, readAt: null, type: { not: 'MESSAGE' } },
  });
  res.json({
    success: true,
    unreadCount,
    notifications: items.map(serializeNotification),
  });
}));

router.post('/notifications/:id/read', authRequired, asyncHandler(async (req, res) => {
  const item = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!item || item.userId !== req.auth.id) {
    return res.status(404).json({ success: false, message: 'Notificação não encontrada' });
  }
  const updated = await prisma.notification.update({
    where: { id: item.id },
    data: { readAt: new Date() },
    include: { actor: true },
  });
  res.json({ success: true, notification: serializeNotification(updated) });
}));

router.post('/notifications/read-all', authRequired, asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.auth.id, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ success: true });
}));

export default router;
