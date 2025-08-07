# 🚀 Deploy Manual no Railway - ERP Reciclagem

## ⚠️ Limitação de Plano
A conta Railway está em plano limitado. Para fazer o deploy, siga as instruções abaixo:

## 📋 Pré-requisitos
1. Acesse [railway.com/account/plans](https://railway.com/account/plans)
2. Faça upgrade do plano ou use os créditos disponíveis

## 🔧 Configuração Manual

### 1. Acesso ao Dashboard
- Acesse: https://railway.app/dashboard
- Login: nexusai.br@gmail.com
- Projeto: feisty-emotion

### 2. Configuração do Serviço
1. No dashboard, clique em "New Service"
2. Selecione "GitHub Repo"
3. Conecte o repositório: `https://github.com/NexusAI-BR/R3CICLE`
4. Selecione a branch: `main`

### 3. Configurações de Deploy
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node backend/index-neon.js",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

### 4. Variáveis de Ambiente
Configure as seguintes variáveis no Railway:

```env
# Servidor
PORT=5000
NODE_ENV=production

# Database - Railway PostgreSQL
DATABASE_URL=postgresql://postgres:PSPUzaVNgLyhoykAnKPXAEZPIRlpIYFo@hopper.proxy.rlwy.net:54273/railway

# CORS - Frontend URL
FRONTEND_URL=https://r3cicle.vercel.app

# JWT
JWT_SECRET=seu_jwt_secret_aqui

# API Keys (se necessário)
API_KEY=sua_api_key_aqui
```

### 5. Configuração de Rede
- **Porta**: 5000
- **Health Check**: `/api/health`
- **Timeout**: 100s

## 🌐 URLs do Sistema

### Produção
- **Frontend**: https://r3cicle.vercel.app
- **Backend**: [Será gerado após deploy]
- **Banco**: hopper.proxy.rlwy.net:54273

### Desenvolvimento
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📊 Status Atual

### ✅ Componentes Prontos
- [x] Frontend deployado no Vercel
- [x] Banco de dados PostgreSQL no Railway
- [x] Repositório GitHub sincronizado
- [x] Backend configurado para Railway
- [x] Variáveis de ambiente configuradas

### ⏳ Pendente
- [ ] Deploy do backend (aguardando upgrade do plano)

## 🔧 Comandos Úteis

### Railway CLI
```bash
# Login
railway login

# Conectar projeto
railway link -p 92b988dd-4af5-40bb-8696-dc567c409559

# Deploy (após upgrade)
railway up

# Logs
railway logs

# Variáveis
railway variables
```

### Teste Local
```bash
# Backend
cd backend
node index-neon.js

# Frontend
cd frontend
npm start
```

## 🚨 Troubleshooting

### Erro de Plano Limitado
```
Your account is on a limited plan. Please visit railway.com/account/plans for details.
```
**Solução**: Upgrade do plano no Railway

### Erro de Conexão com Banco
- Verificar string de conexão
- Confirmar credenciais do PostgreSQL
- Testar conectividade

### Erro de CORS
- Verificar FRONTEND_URL nas variáveis
- Confirmar configuração no backend

## 📝 Próximos Passos

1. **Upgrade do Plano Railway**
   - Acesse railway.com/account/plans
   - Selecione plano adequado

2. **Deploy do Backend**
   - Execute: `railway up`
   - Aguarde conclusão do build

3. **Teste Integração**
   - Teste frontend + backend
   - Verificar funcionalidades

4. **Configuração de Domínio**
   - Configurar domínio customizado
   - Atualizar CORS se necessário

## 📋 Checklist Final

- [ ] Upgrade do plano Railway
- [ ] Deploy do backend concluído
- [ ] URL do backend obtida
- [ ] CORS atualizado no frontend
- [ ] Testes de integração realizados
- [ ] Sistema 100% funcional

---

**Status**: 95% Completo - Aguardando upgrade do plano Railway
**Última atualização**: $(Get-Date -Format "dd/MM/yyyy HH:mm")