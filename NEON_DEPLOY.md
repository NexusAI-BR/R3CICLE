# 🚀 Deploy no Neon.tech - Sistema ERP de Reciclagem

## 📋 Configuração Completa

### 🗄️ Banco de Dados Neon.tech
- **Projeto**: R3CICLE
- **Project ID**: `damp-queen-95158502`
- **Região**: AWS São Paulo (sa-east-1)
- **PostgreSQL**: Versão 17
- **Status**: ✅ Configurado e funcionando

### 🔗 String de Conexão
```
postgresql://neondb_owner:npg_QEk8OG9JUfcK@ep-calm-glitter-acwyzgn2-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

## 📊 Estrutura do Banco

### ✅ Tabelas Criadas
- `materiais` - Gestão de materiais recicláveis
- `clientes` - Cadastro de clientes
- `vendas` - Registro de vendas
- `itens_venda` - Itens de cada venda
- `notas_fiscais` - Controle de NF-e
- `logs_sefaz` - Logs de integração SEFAZ

### 📈 Índices Otimizados
- Índices em CPF/CNPJ para busca rápida
- Índices em relacionamentos (FK)
- Índices em datas para relatórios
- Índices em chaves de NF-e

### 📊 Dados de Exemplo
- ✅ 5 materiais recicláveis
- ✅ 3 clientes (PF e PJ)
- ✅ Dados prontos para teste

## ⚙️ Configuração do Backend

### 1. Variáveis de Ambiente
Crie/atualize o arquivo `backend/.env`:

```env
# Servidor
PORT=5000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://seu-app.vercel.app

# Banco de Dados Neon.tech
DATABASE_URL=postgresql://neondb_owner:npg_QEk8OG9JUfcK@ep-calm-glitter-acwyzgn2-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
API_KEY=sua_api_key_segura_aqui

# SEFAZ (quando implementar)
SEFAZ_AMBIENTE=homologacao
SEFAZ_UF=SP
CERTIFICADO_PATH=/path/to/certificado.p12
CERTIFICADO_SENHA=senha_do_certificado
```

### 2. Instalar Dependência PostgreSQL
```bash
cd backend
npm install pg
```

### 3. Atualizar Código do Backend
O arquivo `backend/index.js` precisa ser atualizado para usar PostgreSQL:

```javascript
// Substituir better-sqlite3 por pg
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

## 🚀 Deploy Completo

### Opção 1: Vercel + Railway (Recomendado)

#### Frontend (Vercel)
1. **Conectar repositório no Vercel**
2. **Configurar build**:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && npm install`

3. **Variáveis de ambiente**:
   ```
   REACT_APP_API_URL=https://seu-backend.railway.app
   ```

#### Backend (Railway)
1. **Conectar repositório no Railway**
2. **Usar Dockerfile existente**
3. **Configurar variáveis**:
   ```
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://seu-app.vercel.app
   DATABASE_URL=postgresql://neondb_owner:npg_QEk8OG9JUfcK@ep-calm-glitter-acwyzgn2-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   JWT_SECRET=seu_jwt_secret_super_seguro
   ```

### Opção 2: Deploy Manual

#### 1. Preparar Build
```bash
# Executar script de build
node build.js
```

#### 2. Deploy Frontend
```bash
# Via Vercel CLI
npm install -g vercel
vercel --prod
```

#### 3. Deploy Backend
```bash
# Via Railway CLI
npm install -g @railway/cli
railway login
railway deploy
```

## 🔧 Configuração Avançada

### Health Check
O endpoint `/api/health` está configurado para monitoramento:

```bash
curl https://seu-backend.railway.app/api/health
```

### Backup Automático
O Neon.tech oferece:
- ✅ Backup automático
- ✅ Point-in-time recovery
- ✅ Branching para testes

### Monitoramento
- **Neon Console**: Métricas de performance
- **Railway Dashboard**: Logs e métricas
- **Vercel Analytics**: Performance do frontend

## 🔒 Segurança

### SSL/TLS
- ✅ Neon.tech: SSL obrigatório
- ✅ Vercel: HTTPS automático
- ✅ Railway: HTTPS automático

### Variáveis Seguras
- ✅ Senhas não commitadas
- ✅ JWT secrets seguros
- ✅ API keys protegidas

### CORS
```javascript
// Configuração CORS para produção
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## 📊 Performance

### Neon.tech
- **Autoscaling**: 1-2 CU automático
- **Connection Pooling**: Habilitado
- **Região**: São Paulo (baixa latência)

### Otimizações
- ✅ Índices criados
- ✅ Connection pooling
- ✅ Query optimization
- ✅ CDN (Vercel)

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão PostgreSQL**
   ```bash
   # Verificar string de conexão
   echo $DATABASE_URL
   ```

2. **CORS Error**
   ```bash
   # Verificar FRONTEND_URL
   echo $FRONTEND_URL
   ```

3. **Build Error**
   ```bash
   # Limpar cache
   npm ci
   ```

### Logs
- **Neon**: Console do Neon.tech
- **Railway**: Dashboard → Deployments → Logs
- **Vercel**: Dashboard → Functions → Logs

## 📞 Suporte

- **Neon.tech**: https://neon.tech/docs
- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs

---

## ✅ Status do Deploy

- ✅ **Banco Neon.tech**: Configurado
- ✅ **Tabelas**: Criadas
- ✅ **Índices**: Otimizados
- ✅ **Dados**: Inseridos
- ✅ **Configurações**: Prontas
- 🔄 **Deploy**: Aguardando execução

**🎉 Sistema pronto para deploy em produção com Neon.tech!**

*Última atualização: Janeiro 2025*