import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeContract } from '../lib/serialize.js';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { toCents } from '../lib/money.js';
import { notify } from '../lib/notify.js';
import { asyncHandler, HttpError } from '../lib/errors.js';

const router = Router();

const include = {
  client: true,
  freelancer: { include: { freelancerProfile: true } },
  service: { include: { media: true } },
  review: true,
};

async function ensureConversation(clientId, freelancerId, contractId) {
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { contractId },
        {
          AND: [
            { participants: { some: { userId: clientId } } },
            { participants: { some: { userId: freelancerId } } },
          ],
        },
      ],
    },
  });
  if (existing) {
    if (!existing.contractId && contractId) {
      return prisma.conversation.update({ where: { id: existing.id }, data: { contractId } });
    }
    return existing;
  }
  return prisma.conversation.create({
    data: {
      contractId,
      participants: { create: [{ userId: clientId }, { userId: freelancerId }] },
    },
  });
}

router.get('/contracts', authRequired, asyncHandler(async (req, res) => {
  const role = req.auth.role || (req.auth.type === 'freelancer' ? 'FREELANCER' : 'CLIENT');
  const status = req.query.status ? String(req.query.status).toUpperCase() : null;
  const where = role === 'FREELANCER'
    ? { freelancerId: req.auth.id }
    : { clientId: req.auth.id };
  if (status) where.status = status;

  const contracts = await prisma.contract.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, contracts: contracts.map(serializeContract) });
}));

router.get('/contracts/:id', authRequired, asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id }, include });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.clientId !== req.auth.id && contract.freelancerId !== req.auth.id) {
    throw new HttpError(403, 'Você não tem permissão para ver este trabalho');
  }
  res.json({ success: true, contract: serializeContract(contract) });
}));

router.post('/contracts', authRequired, requireRole('CLIENT'), asyncHandler(async (req, res) => {
  const kind = req.body.kind === 'QUOTE' ? 'QUOTE' : 'HIRE';
  const freelancerId = req.body.freelancerId;
  const serviceId = req.body.serviceId || null;
  if (!freelancerId) throw new HttpError(400, 'Freelancer é obrigatório');
  if (freelancerId === req.auth.id) throw new HttpError(400, 'Você não pode contratar a si mesmo');

  const freelancer = await prisma.user.findUnique({ where: { id: freelancerId } });
  if (!freelancer || freelancer.role !== 'FREELANCER') throw new HttpError(404, 'Freelancer não encontrado');

  let service = null;
  if (serviceId) {
    service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.freelancerId !== freelancerId || service.status !== 'ACTIVE') {
      throw new HttpError(404, 'Serviço não encontrado');
    }
    await prisma.service.update({ where: { id: service.id }, data: { hireClicks: { increment: 1 } } });
  }

  const title = String(req.body.title || service?.title || '').trim();
  if (!title) throw new HttpError(400, 'Título é obrigatório');

  const price = kind === 'HIRE' && service?.price != null
    ? service.price
    : toCents(req.body.price || req.body.budget);
  const deadlineDays = req.body.deadlineDays || service?.deliveryDays;
  const deadline = deadlineDays
    ? new Date(Date.now() + Number(deadlineDays) * 24 * 60 * 60 * 1000)
    : (req.body.deadline ? new Date(req.body.deadline) : null);

  const contract = await prisma.contract.create({
    data: {
      clientId: req.auth.id,
      freelancerId,
      serviceId,
      kind,
      title,
      description: String(req.body.description || ''),
      budgetHint: toCents(req.body.budgetHint || req.body.budget),
      price,
      deadline,
      status: 'REQUESTED',
    },
    include,
  });

  await ensureConversation(req.auth.id, freelancerId, contract.id);
  await notify({
    userId: freelancerId,
    actorId: req.auth.id,
    type: 'JOB_REQUEST',
    entityId: contract.id,
  });

  res.status(201).json({ success: true, contract: serializeContract(contract) });
}));

router.post('/contracts/:id/accept', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.freelancerId !== req.auth.id) throw new HttpError(403, 'Você não pode aceitar este trabalho');
  if (contract.status !== 'REQUESTED') throw new HttpError(400, 'Esta solicitação já foi respondida');

  const now = new Date();
  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'IN_PROGRESS', acceptedAt: now, startedAt: now },
    include,
  });

  if (updated.price) {
    await prisma.transaction.create({
      data: {
        userId: req.auth.id,
        contractId: updated.id,
        type: 'PENDING',
        amount: updated.price,
        status: 'PENDING',
        description: `Ganho previsto · ${updated.title}`,
      },
    });
  }

  await notify({
    userId: updated.clientId,
    actorId: req.auth.id,
    type: 'JOB_ACCEPTED',
    entityId: updated.id,
  });

  res.json({ success: true, contract: serializeContract(updated) });
}));

router.post('/contracts/:id/reject', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.freelancerId !== req.auth.id) throw new HttpError(403, 'Você não pode recusar este trabalho');
  if (contract.status !== 'REQUESTED') throw new HttpError(400, 'Esta solicitação já foi respondida');

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'REJECTED', cancelledAt: new Date() },
    include,
  });
  await notify({
    userId: updated.clientId,
    actorId: req.auth.id,
    type: 'JOB_REJECTED',
    entityId: updated.id,
  });
  res.json({ success: true, contract: serializeContract(updated) });
}));

router.post('/contracts/:id/deliver', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.freelancerId !== req.auth.id) throw new HttpError(403, 'Você não pode entregar este trabalho');
  if (!['ACCEPTED', 'IN_PROGRESS'].includes(contract.status)) {
    throw new HttpError(400, 'Trabalho não está em andamento');
  }

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'DELIVERED', deliveredAt: new Date() },
    include,
  });
  await notify({
    userId: updated.clientId,
    actorId: req.auth.id,
    type: 'JOB_DELIVERED',
    entityId: updated.id,
  });
  res.json({ success: true, contract: serializeContract(updated) });
}));

router.post('/contracts/:id/complete', authRequired, requireRole('CLIENT'), asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.clientId !== req.auth.id) throw new HttpError(403, 'Você não pode concluir este trabalho');
  if (contract.status !== 'DELIVERED') throw new HttpError(400, 'Aguarde a entrega para concluir');

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
    include,
  });

  await prisma.transaction.updateMany({
    where: { contractId: updated.id, status: 'PENDING' },
    data: { status: 'COMPLETED', type: 'EARNING', description: `Ganho concluído · ${updated.title}` },
  });
  if (updated.price) {
    const existing = await prisma.transaction.findFirst({
      where: { contractId: updated.id, userId: updated.freelancerId, status: 'COMPLETED' },
    });
    if (!existing) {
      await prisma.transaction.create({
        data: {
          userId: updated.freelancerId,
          contractId: updated.id,
          type: 'EARNING',
          amount: updated.price,
          status: 'COMPLETED',
          description: `Ganho concluído · ${updated.title}`,
        },
      });
    }
  }

  await notify({
    userId: updated.freelancerId,
    actorId: req.auth.id,
    type: 'JOB_COMPLETED',
    entityId: updated.id,
  });
  res.json({ success: true, contract: serializeContract(updated) });
}));

router.post('/contracts/:id/cancel', authRequired, asyncHandler(async (req, res) => {
  const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!contract) throw new HttpError(404, 'Trabalho não encontrado');
  if (contract.clientId !== req.auth.id && contract.freelancerId !== req.auth.id) {
    throw new HttpError(403, 'Você não pode cancelar este trabalho');
  }
  if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(contract.status)) {
    throw new HttpError(400, 'Este trabalho não pode ser cancelado');
  }
  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
    include,
  });
  await prisma.transaction.updateMany({
    where: { contractId: updated.id, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  });
  res.json({ success: true, contract: serializeContract(updated) });
}));

export default router;
