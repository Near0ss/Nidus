import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma.js';

const BASE = process.env.API_URL || 'http://127.0.0.1:5000';

async function jsonFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

function cookieJar(res, prev = '') {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  const map = new Map(
    prev.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
      const idx = p.indexOf('=');
      return [p.slice(0, idx), p.slice(idx + 1)];
    }),
  );
  for (const item of raw) {
    if (!item) continue;
    const [pair] = item.split(';');
    const idx = pair.indexOf('=');
    map.set(pair.slice(0, idx).trim(), pair.slice(idx + 1));
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

test('health responde', async () => {
  const { res, data } = await jsonFetch('/api/health');
  assert.equal(res.status, 200);
  assert.equal(data.db, 'prisma');
});

test('GET /api/users não vaza email, telefone ou finanças', async () => {
  const { res, data } = await jsonFetch('/api/users');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data.users));
  assert.ok(data.users.length > 0);
  for (const user of data.users) {
    assert.equal(user.email, undefined);
    assert.equal(user.phone, undefined);
    assert.equal(user.finance, undefined);
    assert.equal(user.passwordHash, undefined);
    assert.equal(user.savedIds, undefined);
    assert.ok(user.username);
  }
});

test('login freelancer e cliente demo', async () => {
  const a = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'marina@nidus.dev', password: 'nidus123' }),
  });
  assert.equal(a.res.status, 200);
  assert.equal(a.data.user.type, 'freelancer');
  assert.ok(a.data.user.email);

  const b = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'bruno@nidus.dev', password: 'nidus123' }),
  });
  assert.equal(b.res.status, 200);
  assert.equal(b.data.user.type, 'normal');

  const demoClient = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'cliente@nidus.test', password: 'nidus123', intendedRole: 'CLIENT' }),
  });
  assert.equal(demoClient.res.status, 200);
  assert.equal(demoClient.data.user.type, 'normal');
  assert.equal(demoClient.data.roleMismatch, false);

  const demoFreelancer = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'freelancer@nidus.test', password: 'nidus123', intendedRole: 'FREELANCER' }),
  });
  assert.equal(demoFreelancer.res.status, 200);
  assert.equal(demoFreelancer.data.user.type, 'freelancer');

  const mismatch = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'cliente@nidus.test', password: 'nidus123', intendedRole: 'FREELANCER' }),
  });
  assert.equal(mismatch.res.status, 200);
  assert.equal(mismatch.data.roleMismatch, true);
  assert.equal(mismatch.data.user.type, 'normal');
});

test('serviços ativos listam Landing Page em React', async () => {
  const { res, data } = await jsonFetch('/api/services?q=Landing%20Page');
  assert.equal(res.status, 200);
  const found = (data.services || []).find((s) => s.title.includes('Landing Page em React'));
  assert.ok(found, 'serviço de seed não encontrado');
  assert.equal(found.price, 1200);
  assert.equal(found.deliveryDays, 7);
});

test('permissões: cliente não edita freelancer, não lê conversa alheia e não vê finanças', async () => {
  const marina = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'marina@nidus.dev', password: 'nidus123' }),
  });
  const bruno = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'bruno@nidus.dev', password: 'nidus123' }),
  });
  const marinaCookie = cookieJar(marina.res);
  const brunoCookie = cookieJar(bruno.res);

  const forbiddenEdit = await jsonFetch(`/api/users/${marina.data.user.id}`, {
    method: 'PUT',
    headers: { Cookie: brunoCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio: 'hack' }),
  });
  assert.equal(forbiddenEdit.res.status, 403);

  const convs = await jsonFetch('/api/conversations', { headers: { Cookie: marinaCookie } });
  assert.equal(convs.res.status, 200);
  const convId = convs.data.conversations?.[0]?.id;
  assert.ok(convId);

  const carla = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'carla@nidus.dev', password: 'nidus123' }),
  });
  const carlaCookie = cookieJar(carla.res);
  const peek = await jsonFetch(`/api/conversations/${convId}/messages`, {
    headers: { Cookie: carlaCookie },
  });
  assert.ok([403, 404].includes(peek.res.status));

  const finance = await jsonFetch('/api/finance', { headers: { Cookie: brunoCookie } });
  assert.equal(finance.res.status, 403);
});

test('review só uma por contrato concluído', async () => {
  const carla = await jsonFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'carla@nidus.dev', password: 'nidus123' }),
  });
  const cookie = cookieJar(carla.res);
  const jobs = await jsonFetch('/api/contracts', { headers: { Cookie: cookie } });
  const done = (jobs.data.contracts || []).find((c) => c.status === 'COMPLETED');
  assert.ok(done);
  const again = await jsonFetch(`/api/contracts/${done.id}/review`, {
    method: 'POST',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 5, comment: 'de novo' }),
  });
  assert.equal(again.res.status, 409);
  await prisma.$disconnect();
});
