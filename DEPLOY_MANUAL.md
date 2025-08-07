# 🚀 Guia de Deploy Manual - Sistema ERP de Reciclagem

## ✅ Status Atual
- ✅ **Backend**: Rodando no Neon.tech (PostgreSQL)
- ✅ **Frontend**: Build de produção criado
- ✅ **Configurações**: Arquivos vercel.json e railway.json prontos
- ✅ **Testes**: Todos os testes de integração passando

## 🌐 Deploy do Frontend (Vercel)

### Opção 1: Via Interface Web (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta (GitHub, Google, etc.)
3. Clique em "New Project"
4. Conecte seu repositório GitHub
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Clique em "Deploy"

### Opção 2: Via CLI
```bash
# No diretório raiz do projeto
vercel login
vercel --prod
```

## 🚂 Deploy do Backend (Railway)

### Opção 1: Via Interface Web (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha seu repositório
6. Configure as variáveis de ambiente:

```env
DATABASE_URL=postgresql://neondb_owner:npg_xxxxxxxxx@ep-xxxxxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://seu-frontend.vercel.app
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
API_KEY=sua_api_key_aqui
SEFAZ_CERTIFICADO_PATH=/app/certificado.p12
SEFAZ_CERTIFICADO_SENHA=senha_do_certificado
SEFAZ_AMBIENTE=homologacao
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

7. O Railway detectará automaticamente o `railway.json` e usará o Dockerfile
8. Clique em "Deploy"

### Opção 2: Via CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## 🔧 Configurações Pós-Deploy

### 1. Atualizar URLs no Backend
Após o deploy do frontend, atualize a variável `CORS_ORIGIN` no Railway:
```env
CORS_ORIGIN=https://seu-app.vercel.app
```

### 2. Atualizar URL da API no Frontend
Se necessário, atualize a URL da API no frontend:
```javascript
// Em src/config.js ou onde estiver a configuração
const API_URL = 'https://seu-backend.railway.app/api';
```

## 🧪 Testes Pós-Deploy

### 1. Testar Backend
```bash
curl https://seu-backend.railway.app/api/health
```

### 2. Testar Frontend
Acesse `https://seu-app.vercel.app` e verifique:
- ✅ Dashboard carrega
- ✅ Materiais são listados
- ✅ Clientes são listados
- ✅ Vendas funcionam
- ✅ Notas fiscais são geradas

## 📊 Monitoramento

### Vercel
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- Logs em tempo real
- Analytics de performance

### Railway
- Dashboard: [railway.app/dashboard](https://railway.app/dashboard)
- Logs do servidor
- Métricas de uso

### Neon.tech
- Dashboard: [console.neon.tech](https://console.neon.tech)
- Monitoramento do banco de dados
- Queries e performance

## 🔒 Segurança

### Variáveis de Ambiente Importantes
- `JWT_SECRET`: Use um valor forte e único
- `API_KEY`: Para autenticação da API
- `DATABASE_URL`: Já configurada com Neon.tech

### CORS
- Configure `CORS_ORIGIN` com a URL exata do frontend
- Nunca use `*` em produção

## 🆘 Troubleshooting

### Erro de CORS
- Verifique se `CORS_ORIGIN` está correto no Railway
- Certifique-se de que não há `/` no final da URL

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta
- Teste a conexão no Neon.tech dashboard

### Build Falha no Vercel
- Verifique se o diretório `frontend` está correto
- Confirme se `package.json` está no diretório frontend

## 📝 Comandos Úteis

```bash
# Testar localmente antes do deploy
npm run test:integration

# Build local do frontend
cd frontend && npm run build

# Testar conexão com Neon
npm run test:neon
```

## 🎉 Deploy Concluído!

Após seguir estes passos, seu Sistema ERP de Reciclagem estará rodando em produção com:
- ✅ Frontend React no Vercel
- ✅ Backend Node.js no Railway  
- ✅ Banco PostgreSQL no Neon.tech
- ✅ SSL/HTTPS automático
- ✅ Monitoramento integrado

**URLs Finais:**
- Frontend: `https://seu-app.vercel.app`
- Backend: `https://seu-backend.railway.app`
- Banco: Neon.tech (gerenciado)

---

*Sistema ERP de Reciclagem - Deploy realizado com sucesso! 🌱*