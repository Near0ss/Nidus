# Backend para Nidus - Exemplos de API

Para testar a API, você pode usar:
1. **Postman** (https://www.postman.com/)
2. **curl** no terminal
3. **Thunder Client** (extensão do VS Code)
4. **API Client** (extensão do VS Code)

## Exemplos de Requisições

### 1. Health Check
```
GET http://localhost:5000/api/health
```

Resposta esperada:
```json
{
  "status": "Backend is running"
}
```

### 2. Registrar novo usuário
```
POST http://localhost:5000/api/register
Headers: Content-Type: application/json
```

Body:
```json
{
  "email": "usuario@email.com",
  "username": "usuario123",
  "password": "senha123",
  "businessName": "Meu Negócio",
  "professionalTitle": ["Designer", "Developer"],
  "bio": "Sou um freelancer experiente",
  "country": "Brasil",
  "state": "São Paulo",
  "projects": [],
  "initialPrice": "100",
  "deliveryTime": "5 dias"
}
```

Resposta esperada:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-aqui",
    "email": "usuario@email.com",
    "username": "usuario123"
  }
}
```

### 3. Login
```
POST http://localhost:5000/api/login
Headers: Content-Type: application/json
```

Body:
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

Ou com username:
```json
{
  "username": "usuario123",
  "password": "senha123"
}
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-aqui",
    "email": "usuario@email.com",
    "username": "usuario123",
    "businessName": "Meu Negócio",
    "professionalTitle": ["Designer", "Developer"]
  }
}
```

### 4. Obter todos os usuários
```
GET http://localhost:5000/api/users
```

Resposta esperada:
```json
{
  "success": true,
  "count": 1,
  "users": [...]
}
```

### 5. Obter usuário específico
```
GET http://localhost:5000/api/users/{id}
```

Substitua `{id}` com o ID real do usuário.

Resposta esperada:
```json
{
  "success": true,
  "user": {...}
}
```

### 6. Atualizar usuário
```
PUT http://localhost:5000/api/users/{id}
Headers: Content-Type: application/json
```

Body (qualquer campo que deseja atualizar):
```json
{
  "businessName": "Novo Nome",
  "bio": "Novo bio"
}
```

Resposta esperada:
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {...}
}
```

### 7. Deletar usuário
```
DELETE http://localhost:5000/api/users/{id}
```

Resposta esperada:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "user": {...}
}
```

## Exemplos com CURL

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Registrar usuário
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "username": "teste123",
    "password": "senha123",
    "businessName": "Teste Negócio",
    "professionalTitle": ["Designer"],
    "bio": "Teste",
    "country": "Brasil",
    "state": "SP",
    "projects": [],
    "initialPrice": "100",
    "deliveryTime": "5 dias"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

### 4. Obter todos os usuários
```bash
curl http://localhost:5000/api/users
```

### 5. Obter usuário específico
```bash
curl http://localhost:5000/api/users/UUID-AQUI
```

### 6. Atualizar usuário
```bash
curl -X PUT http://localhost:5000/api/users/UUID-AQUI \
  -H "Content-Type: application/json" \
  -d '{"businessName": "Novo Nome"}'
```

### 7. Deletar usuário
```bash
curl -X DELETE http://localhost:5000/api/users/UUID-AQUI
```

