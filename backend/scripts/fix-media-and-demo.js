import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const REPLACEMENTS = [
  ['1558655146-d09347e1aa09', '1561070791-2526d30994b5'],
  ['1492724441997-5dc865305b7e', '1542744173-8e7e53415bb0'],
  ['1503608342865-4afea81253ef', '1522202176988-66273c2fd55f'],
];

function rewrite(url) {
  let next = String(url || '');
  for (const [from, to] of REPLACEMENTS) next = next.replaceAll(from, to);
  return next;
}

async function patchModel(model, field) {
  const rows = await prisma[model].findMany({ select: { id: true, [field]: true } });
  let count = 0;
  for (const row of rows) {
    const next = rewrite(row[field]);
    if (next !== row[field]) {
      await prisma[model].update({ where: { id: row.id }, data: { [field]: next } });
      count += 1;
    }
  }
  return count;
}

async function upsertDemo() {
  const passwordHash = await bcrypt.hash('nidus123', 10);

  await prisma.user.upsert({
    where: { email: 'cliente@nidus.test' },
    update: { passwordHash, role: 'CLIENT', username: 'cliente.demo' },
    create: {
      role: 'CLIENT',
      name: 'Cliente Demo',
      username: 'cliente.demo',
      email: 'cliente@nidus.test',
      passwordHash,
      country: 'Brasil',
      state: 'RS',
      city: 'Porto Alegre',
      bio: 'Conta de desenvolvimento para testar a experiência de cliente.',
    },
  });

  const freelancer = await prisma.user.upsert({
    where: { email: 'freelancer@nidus.test' },
    update: { passwordHash, role: 'FREELANCER', username: 'freelancer.demo' },
    create: {
      role: 'FREELANCER',
      name: 'Freelancer Demo',
      username: 'freelancer.demo',
      email: 'freelancer@nidus.test',
      passwordHash,
      country: 'Brasil',
      state: 'SP',
      city: 'São Paulo',
      bio: 'Conta de desenvolvimento para testar o painel freelancer.',
      freelancerProfile: {
        create: {
          businessName: 'Estúdio Demo',
          headline: 'Designer & Developer',
          experience: '4 anos',
          about: 'Perfil demo para validar dashboard, serviços e Social.',
          initialPrice: 90000,
          country: 'Brasil',
          state: 'SP',
          city: 'São Paulo',
        },
      },
    },
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer.id },
    update: { businessName: 'Estúdio Demo' },
    create: {
      userId: freelancer.id,
      businessName: 'Estúdio Demo',
      headline: 'Designer & Developer',
      experience: '4 anos',
      about: 'Perfil demo para validar dashboard, serviços e Social.',
      initialPrice: 90000,
      country: 'Brasil',
      state: 'SP',
      city: 'São Paulo',
    },
  });
}

async function main() {
  const service = await patchModel('serviceMedia', 'url');
  const post = await patchModel('postMedia', 'url');
  const portfolio = await patchModel('portfolioMedia', 'url');
  const banners = await patchModel('user', 'bannerUrl');
  await upsertDemo();
  console.log(JSON.stringify({ service, post, portfolio, banners }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
