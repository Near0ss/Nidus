# 🚀 Guia Rápido - Nidus Backend

## ⚡ Iniciar em 3 Passos

### Passo 1: Instalar dependências do Backend
```bash
cd backend
npm install
```

### Passo 2: Iniciar o Backend
```bash
npm run dev
```

Você verá:
```
🚀 Nidus Backend running on http://localhost:5000
📁 Data directory: backend/data
```

### Passo 3: Iniciar o Frontend (em outro terminal)
```bash
npm run dev
```

Acesse em `http://localhost:5173`

## 📝 Próximos Passos

1. **Registrar um usuário** através da interface web
2. **Verificar os dados salvos** em `backend/data/users.json`
3. **Explorar a API** usando Postman ou curl

## 🔧 Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/register` | Registrar novo usuário |
| POST | `/api/login` | Fazer login |
| GET | `/api/users` | Listar todos os usuários |
| GET | `/api/users/:id` | Obter usuário específico |
| PUT | `/api/users/:id` | Atualizar usuário |
| DELETE | `/api/users/:id` | Deletar usuário |

## 📚 Documentação Completa

- [Backend README](./README.md)
- [Exemplos de API](./API_EXAMPLES.md)

## ⚠️ Importante

Certifique-se de que:
- Backend está rodando na porta `5000`
- Frontend está rodando na porta `5173`
- Ambos estão em execução simultaneamente

