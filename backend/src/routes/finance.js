import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { financeSummary } from '../lib/userQuery.js';
import { fromCents } from '../lib/money.js';
import { asyncHandler } from '../lib/errors.js';

const router = Router();

router.get('/finance', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const summary = await financeSummary(prisma, req.auth.id);
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.auth.id },
    include: { contract: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    success: true,
    note: 'Controle interno do Nidus. Nenhum pagamento externo foi processado.',
    summary: {
      completed: fromCents(summary.completedCents) || 0,
      pending: fromCents(summary.pendingCents) || 0,
      active: fromCents(summary.activeCents) || 0,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      status: t.status,
      amount: fromCents(t.amount),
      description: t.description,
      createdAt: t.createdAt,
      contract: t.contract,
    })),
  });
}));

export default router;
