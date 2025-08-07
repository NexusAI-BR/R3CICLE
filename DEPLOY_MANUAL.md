# 🚀 Manual de Deploy - Neon.tech + GitHub + Vercel

## 📋 Checklist de Deploy

### 1. ✅ **GitHub** - Repositório Online
- [x] Código já está no GitHub
- [x] URL: https://github.com/NexusAI-BR/R3CICLE

### 2. 🗄️ **Neon.tech** - Database PostgreSQL

#### Passo 1: Criar Conta
1. Acesse: https://neon.tech
2. Clique em **"Sign up"**
3. Faça login com GitHub

#### Passo 2: Criar Projeto
1. Clique em **"Create Project"**
2. Nome: `erp-reciclagem`
3. Database: `neondb`
4. Região: `South America (São Paulo)`

#### Passo 3: Copiar Connection String
```bash
postgresql://username:password@host.neon.tech/database?sslmode=require
```

#### Passo 4: Configurar Tabelas
Execute no Neon Console SQL:

```sql
-- Materiais
CREATE TABLE materiais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    preco_kg DECIMAL(10,2) NOT NULL,
    estoque_kg DECIMAL(10,2) DEFAULT 0,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clientes  
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    tipo VARCHAR(20) DEFAULT 'pessoa_fisica',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendas
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens Venda
CREATE TABLE itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materiais(id),
    quantidade_kg DECIMAL(10,2) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notas Fiscais
CREATE TABLE notas_fiscais (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id),
    numero_nf VARCHAR(20) UNIQUE NOT NULL,
    serie VARCHAR(5) DEFAULT '1',
    chave_acesso VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'pendente',
    xml_nfe TEXT,
    pdf_danfe TEXT,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_autorizacao TIMESTAMP,
    protocolo_autorizacao VARCHAR(100),
    motivo_rejeicao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs SEFAZ
CREATE TABLE logs_sefaz (
    id SERIAL PRIMARY KEY,
    nf_id INTEGER REFERENCES notas_fiscais(id),
    operacao VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    mensagem TEXT,
    codigo_retorno VARCHAR(20),
    xml_envio TEXT,
    xml_retorno TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO materiais (nome, tipo, preco_kg, estoque_kg, descricao) VALUES
('Papel Branco', 'Papel', 0.80, 1500.00, 'Papel branco de escritório'),
('Papelão', 'Papel', 0.45, 2000.00, 'Papelão ondulado'),
('Plástico PET', 'Plástico', 1.20, 800.00, 'Garrafas PET transparentes'),
('Alumínio', 'Metal', 4.50, 300.00, 'Latas de alumínio'),
('Ferro', 'Metal', 0.35, 5000.00, 'Sucata de ferro');

INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo) VALUES
('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'pessoa_fisica'),
('Empresa ABC Ltda', '12.345.678/0001-90', 'contato@empresaabc.com', '(11) 3333-4444', 'Av. Principal, 456', 'São Paulo', 'SP', '01234-890', 'pessoa_juridica'),
('Maria Santos', '987.654.321-00', 'maria@email.com', '(11) 88888-7777', 'Rua B, 789', 'Rio de Janeiro', 'RJ', '20123-456', 'pessoa_fisica');
```

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