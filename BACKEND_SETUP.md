# Nidus - Plataforma de Freelancers

## 📋 Estrutura do Projeto

- **Frontend**: Projeto React com Vite
- **Backend**: API REST com Node.js e Express

## 🚀 Como Começar

### 1. Configurar o Backend

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em: `http://localhost:5000`

### 2. Configurar o Frontend (em outro terminal)

```bash
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 📱 Como Usar

1. Abra `http://localhost:5173` no navegador
2. Navegue para a página de Registro
3. Preencha todas as etapas do formulário (4 etapas)
4. Clique em "Criar conta"
5. Os dados serão salvos automaticamente no backend em `backend/data/users.json`

## 🔗 Integração Frontend-Backend

O frontend envia os dados do registro para:
- **Endpoint**: `POST http://localhost:5000/api/register`

Certifique-se de que o backend está rodando antes de tentar registrar um usuário.

## 📊 Dados Salvos

Os dados dos usuários registrados são salvos em formato JSON em:
```
backend/data/users.json
```

## 🛠️ Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run preview` - Visualiza a versão de produção

### Backend
- `npm run dev` - Inicia o servidor com auto-reload
- `npm start` - Inicia o servidor em produção

## 📚 Documentação Adicional

- Veja [backend/README.md](./backend/README.md) para mais detalhes sobre a API

## ⚠️ Notas Importantes

- O backend deve estar rodando na porta 5000
- O frontend deve estar rodando na porta 5173
- As senhas não são criptografadas atualmente (implementar bcrypt em produção)
- Recomenda-se usar um banco de dados real em produção ao invés de JSON

