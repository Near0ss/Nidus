import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeReview } from '../lib/serialize.js';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { notify } from '../lib/notify.js';
import { asyncHandler, HttpError } from '../lib/errors.js';

const router = Router();

router.get('/users/:id/reviews', asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { freelancerId: req.params.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });
  const avg = reviews.length
    ? Math.round((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length) * 10) / 10
    : null;
  res.json({
    success: true,
    rating: avg,
    reviewCount: reviews.length,
    reviews: reviews.map(serializeReview),
  });
}));

router.post('/contracts/:id/review', authRequired, requireRole('CLIENT'), asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.clientId !== req.auth.id) throw new HttpError(403, 'Somente o cliente deste trabalho pode avaliar');
  if (contract.freelancerId === req.auth.id) throw new HttpError(400, 'Você não pode avaliar a si mesmo');
  if (contract.status !== 'COMPLETED') throw new HttpError(400, 'Avalie somente após a conclusão do trabalho');

  const existing = await prisma.review.findUnique({ where: { contractId: contract.id } });
  if (existing) throw new HttpError(409, 'Este trabalho já foi avaliado');

  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'A avaliação deve ser um número de 1 a 5');
  }

  const review = await prisma.review.create({
    data: {
      contractId: contract.id,
      clientId: req.auth.id,
      freelancerId: contract.freelancerId,
      rating,
      comment: String(req.body.comment || '').slice(0, 2000),
    },
    include: { client: true },
  });

  await notify({
    userId: contract.freelancerId,
    actorId: req.auth.id,
    type: 'REVIEW',
    entityId: review.id,
  });

  res.status(201).json({ success: true, review: serializeReview(review) });
}));

export default router;
