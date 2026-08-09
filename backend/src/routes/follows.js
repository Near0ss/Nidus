import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired } from '../middlewares/auth.js';
import { notify } from '../lib/notify.js';
import { asyncHandler, HttpError } from '../lib/errors.js';

const router = Router();

router.post('/users/:id/follow', authRequired, asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.auth.id) throw new HttpError(400, 'Você não pode seguir a si mesmo');
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) throw new HttpError(404, 'Usuário não encontrado');

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: req.auth.id, followingId: targetId } },
  });
  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: req.auth.id, followingId: targetId } },
    });
  } else {
    await prisma.follow.create({ data: { followerId: req.auth.id, followingId: targetId } });
    await notify({ userId: targetId, actorId: req.auth.id, type: 'FOLLOW', entityId: targetId });
  }
  const followerCount = await prisma.follow.count({ where: { followingId: targetId } });
  res.json({ success: true, following: !existing, followerCount });
}));

export default router;
