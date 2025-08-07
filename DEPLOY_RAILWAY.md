# 🚂 Deploy do Backend no Railway

## ✅ Status Atual
- ✅ **Frontend já está online**: https://erp-reciclagem.vercel.app
- ✅ **Perfil Vercel**: https://vercel.com/r3cicle
- ⏳ **Backend**: Pronto para deploy no Railway

## 🎯 Deploy do Backend - 2 Opções

### OPÇÃO 1: Interface Web (Recomendado)

1. **Acesse**: https://railway.app
2. **Faça login** com GitHub/Google
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Conecte seu repositório**
6. **Configure o projeto**:
   - **Root Directory**: `backend`
   - **Start Command**: `node index-neon.js`
   - **Port**: `3001`

### OPÇÃO 2: Linha de Comando

```bash
# 1. Login no Railway
railway login

# 2. Inicializar projeto
railway init

# 3. Deploy
railway up
```

## ⚙️ Variáveis de Ambiente no Railway

**Configure estas variáveis no Railway Dashboard:**

```env
DATABASE_URL=postgresql://neondb_owner:npg_password@ep-host.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=seu_jwt_secret_aqui
PORT=3001
NODE_ENV=production
```

## 🔧 Configuração Final

### 1. Atualizar CORS no Backend

Após o deploy do Railway, você receberá uma URL como:
`https://seu-projeto.railway.app`

**Atualize o frontend** para usar a nova URL da API:

```javascript
// No frontend, arquivo de configuração da API
const API_BASE_URL = 'https://seu-projeto.railway.app';
```

### 2. Testar a Integração

1. **Frontend**: https://erp-reciclagem-k5jamizwh-r3cicles-projects.vercel.app
2. **Backend**: https://seu-projeto.railway.app
3. **Banco**: Neon.tech (já funcionando)

## 🎉 Sistema Completo

### Funcionalidades Disponíveis:
- ✅ Dashboard com gráficos interativos
- ✅ Gestão de notas fiscais
- ✅ Sistema de autenticação
- ✅ Relatórios e análises
- ✅ Interface responsiva
- ✅ API REST completa

### Tecnologias:
- **Frontend**: React + Material-UI (Vercel)
- **Backend**: Node.js + Express (Railway)
- **Banco**: PostgreSQL (Neon.tech)

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs no Railway Dashboard
2. Teste as conexões individualmente
3. Confirme as variáveis de ambiente

---

**🚀 Seu sistema ERP de Reciclagem estará 100% online após o deploy do backend!**