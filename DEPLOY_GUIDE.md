# 🚀 Guia de Deploy - Sistema ERP de Reciclagem

## 📋 Pré-requisitos
- Conta no [Vercel](https://vercel.com) (para frontend)
- Conta no [Railway](https://railway.app) ou [Render](https://render.com) (para backend)
- Git configurado
- Node.js 18+ instalado

## 🎯 Estratégia de Deploy

### Frontend (React) → Vercel
### Backend (Node.js) → Railway
### Banco de Dados → PostgreSQL (Railway/Render)

---

## 🔧 Preparação para Deploy

### 1. Executar Build Script
```bash
node build.js
```

### 2. Configurar Variáveis de Ambiente
Copie `.env.example` para `.env` no backend e configure:

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
JWT_SECRET=seu_jwt_secret_super_seguro
DATABASE_URL=postgresql://user:pass@host:port/db
```

---

## 🌐 Deploy do Frontend (Vercel)

### Opção 1: Via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Opção 2: Via GitHub
1. Faça push do código para GitHub
2. Conecte repositório no Vercel
3. Configure:
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `cd frontend && npm install`

### Variáveis de Ambiente (Vercel)
```
REACT_APP_API_URL=https://seu-backend.railway.app
```

---

## 🚂 Deploy do Backend (Railway)

### 1. Via GitHub
1. Faça push do código para GitHub
2. Conecte repositório no Railway
3. Selecione pasta `backend`
4. Railway detectará automaticamente o Dockerfile

### 2. Configurar Banco PostgreSQL
1. No Railway, adicione PostgreSQL
2. Copie a `DATABASE_URL`
3. Configure nas variáveis de ambiente

### 3. Variáveis de Ambiente (Railway)
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
JWT_SECRET=seu_jwt_secret_super_seguro
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

---

## 🗄️ Migração do Banco de Dados

### SQLite → PostgreSQL

1. **Instalar dependência PostgreSQL**:
```bash
cd backend
npm install pg
```

2. **Atualizar código do banco** (index.js):
```javascript
// Substituir better-sqlite3 por pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

3. **Executar migrations**:
```bash
node migrate.js
```

---

## 🔄 Deploy Automatizado (CI/CD)

### GitHub Actions
Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Backend deploy via Railway webhook"
```

---

## 🌍 Configuração de Domínio

### Frontend (Vercel)
1. Vá em Settings → Domains
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

### Backend (Railway)
1. Vá em Settings → Networking
2. Configure domínio personalizado
3. Atualize CORS no backend

---

## 📊 Monitoramento

### Health Check
O endpoint `/api/health` foi adicionado para monitoramento:

```bash
curl https://seu-backend.railway.app/api/health
```

### Logs
- **Vercel**: Vercel Dashboard → Functions → Logs
- **Railway**: Railway Dashboard → Deployments → Logs

---

## 🔒 Segurança em Produção

### 1. Variáveis de Ambiente
- Nunca commitar arquivos `.env`
- Usar secrets seguros para JWT
- Configurar CORS adequadamente

### 2. HTTPS
- Vercel e Railway fornecem HTTPS automaticamente
- Redirecionar HTTP para HTTPS

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});

app.use('/api/', limiter);
```

---

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Error**
   - Verificar FRONTEND_URL no backend
   - Configurar CORS adequadamente

2. **Database Connection**
   - Verificar DATABASE_URL
   - Testar conexão PostgreSQL

3. **Build Failures**
   - Verificar versões Node.js
   - Limpar cache: `npm ci`

### Comandos Úteis
```bash
# Testar build local
node build.js

# Verificar logs Railway
railway logs

# Verificar logs Vercel
vercel logs
```

---

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **PostgreSQL**: https://www.postgresql.org/docs/

---

**🎉 Parabéns! Seu sistema ERP está pronto para produção!**

*Última atualização: Janeiro 2025*