# Nidus

Plataforma para freelancers divulgarem serviços, conversarem com clientes, acompanharem trabalhos e crescerem no mesmo lugar.

## Rodar em desenvolvimento

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# em outro terminal, na raiz
npm install
npm run dev:front
```

Ou, na raiz, depois do seed:

```bash
npm run dev
```

- Front: http://127.0.0.1:5173/
- API: http://localhost:5000/

## Contas demo

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Cliente | cliente@nidus.test | nidus123 |
| Freelancer | freelancer@nidus.test | nidus123 |
| Freelancer (seed) | marina@nidus.dev | nidus123 |
| Cliente (seed) | bruno@nidus.dev | nidus123 |

Contas migradas do JSON antigo: `Near`, `aaaaaaaa` (senha `20645566Yy*`) e Google `buchholz`.

## Variáveis

Ver `backend/.env.example`.

- `JWT_SECRET` — obrigatório; em produção o servidor recusa o fallback de desenvolvimento
- `DATABASE_URL` — SQLite local (`file:./dev.db`) ou PostgreSQL em produção
- `CORS_ORIGIN` — origens permitidas
- `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` — OAuth Google

## Banco

Prisma + SQLite em desenvolvimento. O schema é compatível com PostgreSQL: troque `provider` e `DATABASE_URL` quando o Postgres estiver disponível.

## Scripts

- `npm run lint` — Oxlint
- `npm run build` — build do front
- `npm test --prefix backend` — testes de regras da API (backend precisa estar no ar)
