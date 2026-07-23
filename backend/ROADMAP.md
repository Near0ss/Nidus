# Roadmap do Backend - Nidus

## ✅ Concluído (MVP)

- [x] Estrutura básica com Express
- [x] CORS configurado
- [x] Salvamento de dados em JSON
- [x] Endpoint de Registro
- [x] Endpoint de Login
- [x] CRUD básico de usuários
- [x] Health check endpoint

## 🚧 Próximas Funcionalidades

### Autenticação e Segurança (Prioridade Alta)
- [ ] Implementar bcrypt para hash de senhas
- [ ] Implementar JWT para autenticação
- [ ] Refresh tokens
- [ ] Rate limiting para proteção contra brute force
- [ ] Validação de email com confirmação
- [ ] Recuperação de senha

### Gerenciamento de Perfil (Prioridade Alta)
- [ ] Upload de foto de perfil
- [ ] Editar informações de perfil
- [ ] Deletar conta
- [ ] Visualizar perfil público
- [ ] Follow/Unfollow de usuários

### Portfólio e Projetos (Prioridade Alta)
- [ ] CRUD de projetos
- [ ] Upload de imagens do portfólio
- [ ] Sistema de avaliações
- [ ] Comentários nos projetos
- [ ] Galeria de trabalhos

### Sistema de Busca (Prioridade Média)
- [ ] Buscar por profissão
- [ ] Buscar por localização
- [ ] Filtros avançados
- [ ] Recomendações

### Mensagens (Prioridade Média)
- [ ] Sistema de chat entre usuários
- [ ] Notificações em tempo real
- [ ] Histórico de mensagens

### Sistema de Pagamento (Prioridade Média)
- [ ] Integração com Stripe
- [ ] Integração com PayPal
- [ ] Histórico de transações
- [ ] Faturamento

### Banco de Dados (Prioridade Média)
- [ ] Migrar de JSON para MongoDB
- [ ] Ou PostgreSQL com ORM (Sequelize/Prisma)
- [ ] Índices de performance
- [ ] Backups automáticos

### Melhorias de Performance (Prioridade Baixa)
- [ ] Cache com Redis
- [ ] Paginação de resultados
- [ ] Compressão de respostas
- [ ] CDN para imagens

### DevOps (Prioridade Baixa)
- [ ] Docker setup
- [ ] CI/CD com GitHub Actions
- [ ] Deploy automático
- [ ] Monitoramento e logs
- [ ] Testes automatizados

## 🔐 Segurança

- [ ] HTTPS em produção
- [ ] Validação mais rigorosa de entrada
- [ ] CSRF protection
- [ ] SQL Injection prevention (quando usar DB)
- [ ] OWASP top 10 compliance

## 📊 Analytics

- [ ] Tracking de usuários
- [ ] Eventos de negócio
- [ ] Dashboard de administrador
- [ ] Relatórios

## 🎯 Como Contribuir

Para adicionar uma funcionalidade:

1. Crie uma branch com o nome da feature
2. Implemente a funcionalidade
3. Adicione testes
4. Atualize esta lista
5. Envie um PR

