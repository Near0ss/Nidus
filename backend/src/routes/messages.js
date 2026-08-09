import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeConversation, serializeMessage } from '../lib/serialize.js';
import { authRequired } from '../middlewares/auth.js';
import { notify } from '../lib/notify.js';
import { asyncHandler, HttpError } from '../lib/errors.js';

const router = Router();

async function findOrCreateConversation(userId, otherId, contractId = null) {
  if (userId === otherId) throw new HttpError(400, 'Não é possível conversar consigo mesmo');

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherId } } },
      ],
    },
    include: { participants: true, contract: true },
  });
  if (existing) {
    if (contractId && !existing.contractId) {
      return prisma.conversation.update({
        where: { id: existing.id },
        data: { contractId },
        include: { participants: true, contract: true },
      });
    }
    return existing;
  }

  return prisma.conversation.create({
    data: {
      contractId,
      participants: { create: [{ userId }, { userId: otherId }] },
    },
    include: { participants: true, contract: true },
  });
}

async function otherParticipant(conversation, userId) {
  const otherId = conversation.participants.find((p) => p.userId !== userId)?.userId;
  if (!otherId) return null;
  return prisma.user.findUnique({
    where: { id: otherId },
    include: { freelancerProfile: true },
  });
}

router.get('/conversations', authRequired, asyncHandler(async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.auth.id } } },
    include: {
      participants: true,
      contract: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const payload = await Promise.all(conversations.map(async (conv) => {
    const other = await otherParticipant(conv, req.auth.id);
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: conv.id,
        senderId: { not: req.auth.id },
        readAt: null,
      },
    });
    return serializeConversation(conv, {
      otherUser: other,
      lastMessage: conv.messages[0],
      unreadCount,
    });
  }));

  res.json({ success: true, conversations: payload });
}));

router.post('/conversations', authRequired, asyncHandler(async (req, res) => {
  const otherId = req.body.userId || req.body.freelancerId;
  if (!otherId) throw new HttpError(400, 'Usuário destino é obrigatório');
  const other = await prisma.user.findUnique({ where: { id: otherId } });
  if (!other) throw new HttpError(404, 'Usuário não encontrado');

  const conv = await findOrCreateConversation(req.auth.id, otherId, req.body.contractId || null);
  const full = await prisma.conversation.findUnique({
    where: { id: conv.id },
    include: { participants: true, contract: true, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  res.json({
    success: true,
    conversation: serializeConversation(full, {
      otherUser: await otherParticipant(full, req.auth.id),
      lastMessage: full.messages[0],
    }),
  });
}));

router.get('/conversations/:id/messages', authRequired, asyncHandler(async (req, res) => {
  const conv = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { participants: true, contract: true },
  });
  if (!conv) throw new HttpError(404, 'Conversa não encontrada');
  if (!conv.participants.some((p) => p.userId === req.auth.id)) {
    throw new HttpError(403, 'Você não tem permissão para ler esta conversa');
  }

  await prisma.message.updateMany({
    where: { conversationId: conv.id, senderId: { not: req.auth.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: conv.id },
    include: { sender: true },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  res.json({
    success: true,
    conversation: serializeConversation(conv, { otherUser: await otherParticipant(conv, req.auth.id) }),
    messages: messages.map(serializeMessage),
  });
}));

router.post('/conversations/:id/messages', authRequired, asyncHandler(async (req, res) => {
  const content = String(req.body.content || '').trim();
  if (!content) throw new HttpError(400, 'Mensagem vazia');

  const conv = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { participants: true },
  });
  if (!conv) throw new HttpError(404, 'Conversa não encontrada');
  if (!conv.participants.some((p) => p.userId === req.auth.id)) {
    throw new HttpError(403, 'Você não tem permissão para enviar nesta conversa');
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: req.auth.id,
      content: content.slice(0, 4000),
    },
    include: { sender: true },
  });
  await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  const otherId = conv.participants.find((p) => p.userId !== req.auth.id)?.userId;
  if (otherId) {
    await notify({ userId: otherId, actorId: req.auth.id, type: 'MESSAGE', entityId: conv.id });
  }

  res.status(201).json({ success: true, message: serializeMessage(message) });
}));

export default router;
