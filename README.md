# Nidus

Plataforma para freelancers divulgarem serviços, conversarem com clientes, acompanharem trabalhos e crescerem no mesmo lugar.

## Rodar em desenvolvimento

```bash
npm install
npm run dev
```

O `npm install` executado na raiz instala frontend e backend, cria a configuração
local do backend e prepara o banco de desenvolvimento. Nas próximas vezes, basta
usar `npm run dev` para iniciar os dois serviços.

- Front: http://127.0.0.1:5173/
- API: http://localhost:5000/

## Contas demo

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Cliente | cliente@nidus.test | nidus123 |
| Freelancer | freelancer@nidus.test | nidus123 |
| Freelancer (seed) | marina@nidus.dev | nidus123 |
| Cliente (seed) | bruno@nidus.dev | nidus123 |


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
