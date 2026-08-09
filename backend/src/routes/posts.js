import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializePost } from '../lib/serialize.js';
import { authOptional, authRequired, requireRole } from '../middlewares/auth.js';
import { publicMediaUrls } from '../lib/mediaUrls.js';
import { notify } from '../lib/notify.js';
import { asyncHandler, HttpError } from '../lib/errors.js';

const router = Router();

function postInclude() {
  return {
    author: { include: { freelancerProfile: true } },
    media: { orderBy: { position: 'asc' } },
    _count: { select: { likes: true, comments: true } },
  };
}

async function extrasFor(userId, posts) {
  if (!userId || !posts.length) {
    return { liked: new Set(), saved: new Set() };
  }
  const ids = posts.map((p) => p.id);
  const [likes, saved] = await Promise.all([
    prisma.postLike.findMany({ where: { userId, postId: { in: ids } }, select: { postId: true } }),
    prisma.savedPost.findMany({ where: { userId, postId: { in: ids } }, select: { postId: true } }),
  ]);
  return {
    liked: new Set(likes.map((l) => l.postId)),
    saved: new Set(saved.map((s) => s.postId)),
  };
}

function toDto(post, extras) {
  return serializePost(post, {
    likeCount: post._count?.likes ?? post.likes?.length ?? 0,
    commentCount: post._count?.comments ?? post.comments?.length ?? 0,
    liked: extras.liked.has(post.id),
    saved: extras.saved.has(post.id),
    includeComments: Boolean(post.comments),
  });
}

router.get('/feed', authOptional, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = {};
  if (q) {
    where.OR = [
      { content: { contains: q } },
      { author: { OR: [{ name: { contains: q } }, { username: { contains: q } }] } },
    ];
  }
  const posts = await prisma.post.findMany({
    where,
    include: postInclude(),
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const extras = await extrasFor(req.auth?.id, posts);
  res.json({
    success: true,
    feed: posts.map((p) => toDto(p, extras)),
  });
}));

router.get('/posts', authOptional, asyncHandler(async (req, res) => {
  const authorId = req.query.authorId || null;
  const posts = await prisma.post.findMany({
    where: authorId ? { authorId } : {},
    include: postInclude(),
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const extras = await extrasFor(req.auth?.id, posts);
  res.json({ success: true, posts: posts.map((p) => toDto(p, extras)) });
}));

router.get('/posts/:id', authOptional, asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      ...postInclude(),
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!post) throw new HttpError(404, 'Publicação não encontrada');
  const extras = await extrasFor(req.auth?.id, [post]);
  res.json({ success: true, post: toDto(post, extras) });
}));

router.post('/posts', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const content = String(req.body.content || '').trim();
  const images = publicMediaUrls(req.body.images, 6);
  if (!content && images.length === 0) throw new HttpError(400, 'Escreva algo ou adicione uma imagem');

  const post = await prisma.post.create({
    data: {
      authorId: req.auth.id,
      content: content.slice(0, 4000),
      media: { create: images.map((url, index) => ({ url, type: 'IMAGE', position: index })) },
    },
    include: postInclude(),
  });
  res.status(201).json({ success: true, post: toDto(post, { liked: new Set(), saved: new Set() }) });
}));

router.delete('/posts/:id', authRequired, asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new HttpError(404, 'Publicação não encontrada');
  if (post.authorId !== req.auth.id) throw new HttpError(403, 'Você não pode excluir esta publicação');
  await prisma.post.delete({ where: { id: post.id } });
  res.json({ success: true, message: 'Publicação excluída' });
}));

router.post('/posts/:id/like', authRequired, asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new HttpError(404, 'Publicação não encontrada');

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: post.id, userId: req.auth.id } },
  });
  if (existing) {
    await prisma.postLike.delete({ where: { postId_userId: { postId: post.id, userId: req.auth.id } } });
  } else {
    await prisma.postLike.create({ data: { postId: post.id, userId: req.auth.id } });
    await notify({ userId: post.authorId, actorId: req.auth.id, type: 'LIKE', entityId: post.id });
  }
  const likeCount = await prisma.postLike.count({ where: { postId: post.id } });
  res.json({ success: true, liked: !existing, likeCount });
}));

router.get('/posts/:id/comments', authOptional, asyncHandler(async (req, res) => {
  const comments = await prisma.comment.findMany({
    where: { postId: req.params.id },
    include: { author: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json({
    success: true,
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: {
        id: c.author.id,
        name: c.author.name,
        username: c.author.username,
        profilePhoto: c.author.avatarUrl,
      },
    })),
  });
}));

router.post('/posts/:id/comments', authRequired, asyncHandler(async (req, res) => {
  const content = String(req.body.content || '').trim();
  if (!content) throw new HttpError(400, 'Comentário vazio');
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new HttpError(404, 'Publicação não encontrada');

  const comment = await prisma.comment.create({
    data: { postId: post.id, authorId: req.auth.id, content: content.slice(0, 2000) },
    include: { author: true },
  });
  await notify({ userId: post.authorId, actorId: req.auth.id, type: 'COMMENT', entityId: post.id });
  res.status(201).json({
    success: true,
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        username: comment.author.username,
        profilePhoto: comment.author.avatarUrl,
      },
    },
  });
}));

router.post('/posts/:id/save', authRequired, asyncHandler(async (req, res) => {
  const post = await prisma.post.findUnique({ where: { id: req.params.id } });
  if (!post) throw new HttpError(404, 'Publicação não encontrada');
  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: req.auth.id, postId: post.id } },
  });
  if (existing) {
    await prisma.savedPost.delete({ where: { userId_postId: { userId: req.auth.id, postId: post.id } } });
  } else {
    await prisma.savedPost.create({ data: { userId: req.auth.id, postId: post.id } });
  }
  res.json({ success: true, saved: !existing });
}));

export default router;
