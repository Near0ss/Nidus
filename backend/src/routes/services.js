import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { serializeService } from '../lib/serialize.js';
import { authOptional, authRequired, requireRole } from '../middlewares/auth.js';
import { toCents } from '../lib/money.js';
import { uniqueSlug } from '../lib/slug.js';
import { asyncHandler, HttpError } from '../lib/errors.js';
import { publicMediaUrls } from '../lib/mediaUrls.js';

const router = Router();

const PRICE_TYPES = new Set(['FIXED', 'STARTING_AT', 'NEGOTIABLE']);
const STATUSES = new Set(['ACTIVE', 'PAUSED', 'DRAFT', 'ARCHIVED']);

function serviceInclude() {
  return {
    media: { orderBy: { position: 'asc' } },
    category: true,
    freelancer: {
      include: {
        freelancerProfile: { include: { skills: { include: { skill: true } } } },
        reviewsReceived: { select: { rating: true } },
        _count: { select: { contractsAsFreelancer: { where: { status: 'COMPLETED' } } } },
      },
    },
  };
}

function serializeListItem(service, savedIds = new Set()) {
  return serializeService(service, {
    saved: savedIds.has(service.id),
    completedJobs: service.freelancer?._count?.contractsAsFreelancer || 0,
  });
}

router.get('/services', authOptional, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const category = String(req.query.category || '').trim();
  const city = String(req.query.city || '').trim();
  const state = String(req.query.state || '').trim();
  const minPrice = toCents(req.query.minPrice);
  const maxPrice = toCents(req.query.maxPrice);
  const maxDays = req.query.maxDays ? Number(req.query.maxDays) : null;
  const minRating = req.query.minRating ? Number(req.query.minRating) : null;
  const sort = String(req.query.sort || 'recent');

  const where = { status: 'ACTIVE' };
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { freelancer: { OR: [{ name: { contains: q } }, { username: { contains: q } }] } },
    ];
  }
  if (category) {
    where.OR = [
      ...(where.OR || []),
      { category: { slug: category } },
      { category: { name: { contains: category } } },
      { subcategory: { contains: category } },
    ];
  }
  if (city) where.freelancer = { ...(where.freelancer || {}), city: { contains: city } };
  if (state) where.freelancer = { ...(where.freelancer || {}), state: { contains: state } };
  if (minPrice != null || maxPrice != null) {
    where.price = {};
    if (minPrice != null) where.price.gte = minPrice;
    if (maxPrice != null) where.price.lte = maxPrice;
  }
  if (maxDays) where.deliveryDays = { lte: maxDays };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };
  if (sort === 'views') orderBy = { views: 'desc' };

  const services = await prisma.service.findMany({
    where,
    include: serviceInclude(),
    orderBy,
    take: 60,
  });

  let filtered = services;
  if (minRating) {
    filtered = services.filter((s) => {
      const reviews = s.freelancer?.reviewsReceived || [];
      if (!reviews.length) return false;
      const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
      return avg >= minRating;
    });
  }

  let savedIds = new Set();
  if (req.auth?.id) {
    const saved = await prisma.savedService.findMany({
      where: { userId: req.auth.id, serviceId: { in: filtered.map((s) => s.id) } },
      select: { serviceId: true },
    });
    savedIds = new Set(saved.map((s) => s.serviceId));
  }

  res.json({ success: true, services: filtered.map((s) => serializeListItem(s, savedIds)) });
}));

router.get('/services/:id', authOptional, asyncHandler(async (req, res) => {
  const service = await prisma.service.findUnique({
    where: { id: req.params.id },
    include: serviceInclude(),
  });
  if (!service || (service.status !== 'ACTIVE' && req.auth?.id !== service.freelancerId)) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (req.auth?.id !== service.freelancerId) {
    await prisma.service.update({ where: { id: service.id }, data: { views: { increment: 1 } } });
    await prisma.serviceView.create({
      data: { serviceId: service.id, viewerId: req.auth?.id || null },
    });
    service.views += 1;
  }

  const saved = req.auth?.id
    ? Boolean(await prisma.savedService.findUnique({
      where: { userId_serviceId: { userId: req.auth.id, serviceId: service.id } },
    }))
    : false;

  res.json({
    success: true,
    service: serializeService(service, {
      saved,
      completedJobs: service.freelancer?._count?.contractsAsFreelancer || 0,
    }),
  });
}));

router.get('/me/services', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const services = await prisma.service.findMany({
    where: { freelancerId: req.auth.id },
    include: serviceInclude(),
    orderBy: { updatedAt: 'desc' },
  });
  res.json({ success: true, services: services.map((s) => serializeListItem(s)) });
}));

router.post('/services', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const title = String(req.body.title || '').trim();
  if (!title) throw new HttpError(400, 'Título é obrigatório');

  const priceType = PRICE_TYPES.has(req.body.priceType) ? req.body.priceType : 'FIXED';
  const status = STATUSES.has(req.body.status) ? req.body.status : 'ACTIVE';
  const images = publicMediaUrls(req.body.images, 8);

  let categoryId = req.body.categoryId || null;
  if (!categoryId && req.body.category) {
    const name = String(req.body.category).trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categoryId = cat.id;
  }

  const service = await prisma.service.create({
    data: {
      freelancerId: req.auth.id,
      title,
      slug: uniqueSlug(title),
      description: String(req.body.description || ''),
      includes: String(req.body.includes || ''),
      categoryId,
      subcategory: String(req.body.subcategory || ''),
      priceType,
      price: priceType === 'NEGOTIABLE' ? null : toCents(req.body.price),
      deliveryDays: req.body.deliveryDays ? Number(req.body.deliveryDays) : null,
      status,
      media: {
        create: images.map((url, index) => ({ url, position: index, type: 'IMAGE' })),
      },
    },
    include: serviceInclude(),
  });

  res.status(201).json({ success: true, service: serializeListItem(service) });
}));

router.put('/services/:id', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Serviço não encontrado');
  if (existing.freelancerId !== req.auth.id) throw new HttpError(403, 'Você não pode editar este serviço');

  const data = {};
  if (req.body.title !== undefined) data.title = String(req.body.title).trim();
  if (req.body.description !== undefined) data.description = String(req.body.description || '');
  if (req.body.includes !== undefined) data.includes = String(req.body.includes || '');
  if (req.body.subcategory !== undefined) data.subcategory = String(req.body.subcategory || '');
  if (PRICE_TYPES.has(req.body.priceType)) data.priceType = req.body.priceType;
  if (req.body.price !== undefined) data.price = toCents(req.body.price);
  if (req.body.deliveryDays !== undefined) data.deliveryDays = req.body.deliveryDays ? Number(req.body.deliveryDays) : null;
  if (STATUSES.has(req.body.status)) data.status = req.body.status;
  if (req.body.categoryId) data.categoryId = req.body.categoryId;
  if (req.body.category) {
    const name = String(req.body.category).trim();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cat = await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
    data.categoryId = cat.id;
  }

  if (Array.isArray(req.body.images)) {
    await prisma.serviceMedia.deleteMany({ where: { serviceId: existing.id } });
    await prisma.serviceMedia.createMany({
      data: publicMediaUrls(req.body.images, 8).map((url, index) => ({
        serviceId: existing.id,
        url,
        position: index,
        type: 'IMAGE',
      })),
    });
  }

  const service = await prisma.service.update({
    where: { id: existing.id },
    data,
    include: serviceInclude(),
  });
  res.json({ success: true, service: serializeListItem(service) });
}));

router.post('/services/:id/pause', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Serviço não encontrado');
  if (existing.freelancerId !== req.auth.id) throw new HttpError(403, 'Você não pode pausar este serviço');
  const next = existing.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
  const service = await prisma.service.update({
    where: { id: existing.id },
    data: { status: next },
    include: serviceInclude(),
  });
  res.json({ success: true, service: serializeListItem(service) });
}));

router.delete('/services/:id', authRequired, requireRole('FREELANCER'), asyncHandler(async (req, res) => {
  const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, 'Serviço não encontrado');
  if (existing.freelancerId !== req.auth.id) throw new HttpError(403, 'Você não pode excluir este serviço');
  await prisma.service.update({ where: { id: existing.id }, data: { status: 'ARCHIVED' } });
  res.json({ success: true, message: 'Serviço arquivado' });
}));

export default router;
