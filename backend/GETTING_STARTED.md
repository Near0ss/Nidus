# 🎯 Nidus Backend - Como Usar

## 📋 Resumo do que foi criado

Um **backend completo em Node.js + Express** que:
- ✅ Salva dados do formulário de registro em JSON
- ✅ Permite login de usuários
- ✅ Gerencia usuários (CRUD)
- ✅ Está integrado com o frontend React

## 🚀 Iniciar Agora

### 1️⃣ Instalar o Backend
```bash
cd backend
npm install
```

### 2️⃣ Rodar o Backend (Terminal 1)
```bash
cd backend
npm run dev
```

**Resultado esperado:**
```
🚀 Nidus Backend running on http://localhost:5000
📁 Data directory: backend/data
```

### 3️⃣ Rodar o Frontend (Terminal 2)
```bash
npm run dev
```

**Resultado esperado:**
```
VITE v8.1.1  ready in 250 ms

➜  Local:   http://localhost:5173/
```

## 🧪 Testar o Sistema

### Opção 1: Via Interface Web (Recomendado)

1. Abra `http://localhost:5173`
2. Vá para Registro (Register)
3. Preencha as 4 etapas:
   - **Etapa 1:** Email, Username, Senha
   - **Etapa 2:** Nome do negócio, Profissões, País, Estado
   - **Etapa 3:** Projetos (opcional)
   - **Etapa 4:** Revisar e Criar Conta
4. Clique em "Criar conta"
5. Veja a mensagem ✅ de sucesso

### Opção 2: Via Postman

1. Abra o Postman
2. Crie nova requisição:
   - **Tipo:** POST
   - **URL:** `http://localhost:5000/api/register`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
   ```json
   {
     "email": "teste@email.com",
     "username": "teste123",
     "password": "senha123",
     "businessName": "Meu Negócio",
     "professionalTitle": ["Designer"],
     "bio": "Teste",
     "country": "Brasil",
     "state": "SP",
     "projects": [],
     "initialPrice": "100",
     "deliveryTime": "5 dias"
   }
   ```
3. Clique em "Send"

### Opção 3: Via Terminal (cURL)

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "username": "teste123",
    "password": "senha123",
    "businessName": "Meu Negócio",
    "professionalTitle": ["Designer"],
    "bio": "Teste",
    "country": "Brasil",
    "state": "SP",
    "projects": [],
    "initialPrice": "100",
    "deliveryTime": "5 dias"
  }'
```

## 📂 Verificar Dados Salvos

Os dados são salvos em:
```
backend/data/users.json
```

Abra este arquivo para ver os usuários registrados no formato JSON.

## 🔗 Endpoints Disponíveis

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/health` | GET | Verifica se backend está rodando |
| `/api/register` | POST | Registra novo usuário |
| `/api/login` | POST | Faz login de usuário |
| `/api/users` | GET | Lista todos os usuários |
| `/api/users/:id` | GET | Obtém usuário específico |
| `/api/users/:id` | PUT | Atualiza usuário |
| `/api/users/:id` | DELETE | Deleta usuário |

## ❌ Troubleshooting

### "Cannot POST /api/register"
```bash
# Solução: Backend não está rodando
cd backend
npm run dev
```

### "Network Error" ou "Failed to fetch"
```bash
# Solução: Backend está em porta diferente
# Verifique se está em http://localhost:5000
# Reinicie o backend
```

### "Email or username already in use"
```bash
# Solução: Use email e username diferentes
# Ou delete backend/data/users.json e reinicie
```

## 📚 Documentação Completa

- 📖 [Backend Setup](./backend/README.md)
- ⚡ [Quick Start](./backend/QUICK_START.md)
- 📡 [API Examples](./backend/API_EXAMPLES.md)
- 🔄 [Integration Guide](./INTEGRATION_GUIDE.md)
- 🗺️ [Roadmap](./backend/ROADMAP.md)

## 🎓 O que o Backend Faz

1. **Recebe dados** do formulário de registro
2. **Valida** os dados
3. **Verifica duplicatas** (email/username)
4. **Cria novo usuário** com UUID único
5. **Salva em JSON** (`backend/data/users.json`)
6. **Retorna resposta** ao frontend

## 🔐 Próximos Passos (Futuros)

- [ ] Hash de senhas com bcrypt
- [ ] Autenticação com JWT
- [ ] Upload de fotos de perfil
- [ ] Sistema de projetos/portfólio
- [ ] Migrar para banco de dados real (MongoDB/PostgreSQL)

---

**Tudo pronto!** 🎉 Seu backend está funcionando e salvando dados do registro em JSON.

