# Integração Frontend-Backend

## 📱 Fluxo de Dados - Registro

### Passo 1: Usuário preenche o formulário

```
Register.jsx (React Component)
├── formData state
│   ├── email
│   ├── username
│   ├── password
│   ├── businessName
│   ├── professionalTitle[]
│   ├── bio
│   ├── country
│   ├── state
│   ├── projects[]
│   ├── initialPrice
│   └── deliveryTime
```

### Passo 2: Frontend envia os dados

```javascript
// Register.jsx - função submitRegister()
fetch('http://localhost:5000/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

**Requisição HTTP:**
- **URL:** `http://localhost:5000/api/register`
- **Método:** POST
- **Headers:** `Content-Type: application/json`
- **Body:** Todos os dados do formulário

### Passo 3: Backend processa os dados

```
server.js - POST /api/register
├── Validação básica
├── Verificação de email/username duplicados
├── Criação do novo usuário com UUID
├── Salvamento em JSON
└── Resposta ao cliente
```

### Passo 4: Resposta para o frontend

**Sucesso (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-gerado",
    "email": "usuario@email.com",
    "username": "usuario123"
  }
}
```

**Erro (409 - Email/Username duplicado):**
```json
{
  "success": false,
  "message": "Email or username already in use"
}
```

### Passo 5: Frontend exibe resultado

```javascript
// FinalStep.jsx
if (response.ok) {
  setSuccess('Conta criada com sucesso!') // Verde ✅
  // Reseta formulário após 2 segundos
} else {
  setError(data.message) // Vermelho ❌
}
```

## 📊 Dados Salvos

Os dados são salvos em `backend/data/users.json`:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@email.com",
    "username": "usuario123",
    "password": "senha123",
    "businessName": "Meu Negócio",
    "professionalTitle": ["Designer", "Developer"],
    "bio": "Minha bio",
    "country": "Brasil",
    "state": "São Paulo",
    "projects": [],
    "initialPrice": "100",
    "deliveryTime": "5 dias",
    "createdAt": "2025-01-20T10:30:00.000Z",
    "updatedAt": "2025-01-20T10:30:00.000Z"
  }
]
```

## 🔗 Endpoints Utilizados

### Registro (Implementado)
- **POST** `/api/register` - Cria um novo usuário

### Login (Implementado)
- **POST** `/api/login` - Autentica usuário

### Futuros (a Implementar)
- **GET** `/api/profile/:id` - Obter perfil do usuário
- **PUT** `/api/profile/:id` - Atualizar perfil
- **DELETE** `/api/profile/:id` - Deletar perfil
- **POST** `/api/projects` - Criar projeto
- **GET** `/api/projects/:userId` - Obter projetos do usuário

## 🚨 Possíveis Erros

### Erro: "Cannot POST /api/register"
- ❌ Backend não está rodando
- ✅ Execute `npm run dev` na pasta `backend`

### Erro: "Network error" ou "Failed to fetch"
- ❌ Backend está em porta diferente
- ✅ Verifique se está em `http://localhost:5000`
- ✅ Verifique CORS no servidor

### Erro: "Email or username already in use"
- ❌ Email ou username já foram registrados
- ✅ Use email e username diferentes

### Erro: "Invalid password"
- ❌ Senha incorreta no login
- ✅ Verifique maiúsculas e espaços

## 🔄 Arquitetura Geral

```
┌─────────────────────┐
│   Frontend (React)  │
│   Port: 5173        │
└──────────┬──────────┘
           │
           │ HTTP Requests (JSON)
           │
           ▼
┌─────────────────────┐
│ Backend (Express)   │
│ Port: 5000          │
└──────────┬──────────┘
           │
           │ Operações de Arquivo
           │
           ▼
┌─────────────────────┐
│ JSON Database       │
│ data/users.json     │
└─────────────────────┘
```

## 🔐 Segurança (Futura)

Atualmente, as senhas são armazenadas em texto plano. Para produção:

1. **Hash com bcrypt:**
```javascript
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **JWT para autenticação:**
```javascript
import jwt from 'jsonwebtoken';
const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '24h' });
```

3. **Middleware de autenticação:**
```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, 'secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

