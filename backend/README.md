# Nidus Backend - Guia de Instalação e Uso

## 📦 Instalação

### 1. Instale as dependências do backend

```bash
cd backend
npm install
```

### 2. Configure as variáveis de ambiente (opcional)

Crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

Você pode editar o arquivo `.env` para alterar a porta se necessário:

```
PORT=5000
NODE_ENV=development
```

## 🚀 Rodar o Backend

### Em desenvolvimento (com auto-reload):

```bash
npm run dev
```

### Em produção:

```bash
npm start
```

O servidor estará disponível em: `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
- **GET** `/api/health`
- Verifica se o backend está funcionando

### 2. Registrar novo usuário
- **POST** `/api/register`
- Body (JSON):
```json
{
  "email": "usuario@email.com",
  "username": "usuario123",
  "password": "senha123",
  "businessName": "Meu Negócio",
  "professionalTitle": ["Designer", "Developer"],
  "bio": "Biografia do usuário",
  "country": "Brasil",
  "state": "São Paulo",
  "projects": [],
  "initialPrice": "100",
  "deliveryTime": "5 dias"
}
```

### 3. Obter todos os usuários
- **GET** `/api/users`
- Retorna lista de todos os usuários cadastrados

### 4. Obter usuário específico
- **GET** `/api/users/:id`
- Retorna dados de um usuário específico

### 5. Atualizar usuário
- **PUT** `/api/users/:id`
- Body: Qualquer campo que deseja atualizar

### 6. Deletar usuário
- **DELETE** `/api/users/:id`

## 📁 Estrutura de Dados

Os dados dos usuários são salvos em: `backend/data/users.json`

Exemplo de estrutura:
```json
[
  {
    "id": "uuid-aqui",
    "email": "usuario@email.com",
    "username": "usuario123",
    "password": "senha123",
    "businessName": "Meu Negócio",
    "professionalTitle": ["Designer"],
    "bio": "",
    "country": "Brasil",
    "state": "São Paulo",
    "projects": [],
    "initialPrice": "",
    "deliveryTime": "",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
]
```

## ⚠️ Importante para Produção

1. **Hash de Senhas**: Atualmente as senhas não são criptografadas. Use bcrypt para produção.
2. **Autenticação**: Implemente JWT ou sessões para autenticação.
3. **Validação**: Adicione validação mais robusta dos dados.
4. **Banco de Dados**: Considere migrar de JSON para um banco de dados real (MongoDB, PostgreSQL, etc).
5. **CORS**: Atualize a origem CORS quando estiver em produção.

## 🔧 Desenvolvimento Futuro

- Adicionar autenticação com JWT
- Implementar criptografia de senhas
- Adicionar upload de imagens
- Criar endpoints para gerenciamento de perfis
- Adicionar autenticação de email
- Implementar sistema de projetos e portfólio

