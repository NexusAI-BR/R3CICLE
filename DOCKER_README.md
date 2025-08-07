# 🐳 R3CICLE ERP - Docker Setup

## 📋 **Visão Geral**

Sistema ERP completo rodando em containers Docker com:
- **Frontend React** (Nginx)
- **Backend Node.js** (Express + PostgreSQL)
- **Database PostgreSQL** 
- **Nginx Reverse Proxy**

## 🚀 **Início Rápido**

### **Pré-requisitos:**
- Docker Desktop instalado
- Docker Compose
- 8GB RAM disponível
- Portas 3000, 5000, 5432 livres

### **1. Clone e Configure:**
```bash
git clone https://github.com/NexusAI-BR/R3CICLE.git
cd R3CICLE
```

### **2. Inicie o Sistema:**

#### **Windows (PowerShell):**
```powershell
.\docker-scripts.ps1 start
```

#### **Linux/Mac:**
```bash
chmod +x docker-scripts.sh
./docker-scripts.sh start
```

#### **Manualmente:**
```bash
docker-compose up -d
```

### **3. Acesse o Sistema:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health
- **Database:** localhost:5432

## 🛠️ **Comandos Disponíveis**

### **Scripts de Gerenciamento:**

| Comando | Descrição |
|---------|-----------|
| `start` | Iniciar sistema produção |
| `dev` | Iniciar modo desenvolvimento |
| `stop` | Parar todos containers |
| `restart` | Reiniciar sistema |
| `build` | Build todas as imagens |
| `logs` | Ver logs em tempo real |
| `status` | Status dos containers |
| `backup` | Backup do banco |
| `restore` | Restaurar backup |
| `clean` | Limpar tudo (⚠️ DADOS) |

### **Exemplos:**
```bash
# Iniciar sistema
./docker-scripts.sh start

# Desenvolvimento com hot-reload
./docker-scripts.sh dev

# Ver logs
./docker-scripts.sh logs

# Backup do banco
./docker-scripts.sh backup

# Restaurar backup
./docker-scripts.sh restore backup_20240101_120000.sql
```

## 🔧 **Configuração**

### **Variáveis de Ambiente (.env.docker):**
```env
# Database
POSTGRES_DB=r3cicle
POSTGRES_USER=r3cicle_user
POSTGRES_PASSWORD=r3cicle_password_2024

# Backend
NODE_ENV=production
DATABASE_URL=postgresql://r3cicle_user:r3cicle_password_2024@database:5432/r3cicle

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### **Portas Utilizadas:**
- **3000**: Frontend React
- **5000**: Backend API
- **5432**: PostgreSQL Database
- **80**: Nginx Proxy (opcional)

## 📁 **Estrutura Docker**

```
├── backend/
│   ├── Dockerfile          # Produção
│   ├── Dockerfile.dev      # Desenvolvimento
│   └── index-neon.js       # Aplicação principal
├── frontend/
│   ├── Dockerfile          # Build multi-stage
│   ├── Dockerfile.dev      # Desenvolvimento
│   └── nginx.conf          # Configuração Nginx
├── database/
│   └── init.sql            # Schema inicial
├── docker-compose.yml      # Produção
├── docker-compose.dev.yml  # Desenvolvimento
└── .env.docker             # Variáveis ambiente
```

## 🚀 **Modos de Execução**

### **1. Produção (Otimizado):**
- Frontend buildado e servido pelo Nginx
- Backend otimizado para performance
- PostgreSQL com persistência de dados
- Health checks automáticos
- Logs centralizados

```bash
docker-compose up -d
```

### **2. Desenvolvimento (Hot-reload):**
- Frontend com live-reload
- Backend com nodemon
- Volumes sincronizados
- Debug habilitado

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 📊 **Monitoramento**

### **Health Checks:**
- **Frontend**: HTTP GET /
- **Backend**: HTTP GET /api/health
- **Database**: pg_isready

### **Logs:**
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
```

### **Status:**
```bash
docker-compose ps
```

## 💾 **Backup e Restore**

### **Backup Automático:**
```bash
./docker-scripts.sh backup
# Cria: backup_YYYYMMDD_HHMMSS.sql
```

### **Restaurar Backup:**
```bash
./docker-scripts.sh restore backup_20240101_120000.sql
```

### **Backup Manual:**
```bash
docker exec r3cicle_db pg_dump -U r3cicle_user -d r3cicle > backup.sql
```

## 🔒 **Segurança**

### **Implementado:**
- ✅ Usuários não-root nos containers
- ✅ Health checks automáticos
- ✅ Secrets via environment variables
- ✅ Network isolation
- ✅ Security headers no Nginx

### **Recomendações para Produção:**
- [ ] HTTPS com certificados SSL
- [ ] Backup automatizado
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Log aggregation
- [ ] Container registry privado

## 🚨 **Troubleshooting**

### **Container não inicia:**
```bash
# Verificar logs
docker-compose logs [serviço]

# Verificar recursos
docker system df
```

### **Porta já em uso:**
```bash
# Verificar portas ocupadas
netstat -tulpn | grep :3000

# Alterar porta no docker-compose.yml
ports:
  - "3001:3000"  # Muda para porta 3001
```

### **Problemas de permissão:**
```bash
# Linux/Mac - dar permissão aos scripts
chmod +x docker-scripts.sh

# Windows - executar como Admin
```

### **Database não conecta:**
```bash
# Verificar se PostgreSQL iniciou
docker-compose logs database

# Testar conexão manual
docker exec -it r3cicle_db psql -U r3cicle_user -d r3cicle
```

### **Frontend não carrega:**
```bash
# Verificar build
docker-compose logs frontend

# Rebuild se necessário
docker-compose build --no-cache frontend
```

## 📈 **Escalabilidade**

### **Para produção em larga escala:**

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
  
  frontend:
    deploy:
      replicas: 2
```

### **Load Balancer:**
```nginx
upstream backend {
    server backend_1:5000;
    server backend_2:5000;
    server backend_3:5000;
}
```

## 📝 **To-Do**

- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Monitoring stack
- [ ] Backup automation
- [ ] SSL/TLS certificates
- [ ] Container scanning

---

## 💡 **Suporte**

- **Issues**: https://github.com/NexusAI-BR/R3CICLE/issues
- **Documentation**: https://github.com/NexusAI-BR/R3CICLE/wiki
- **Docker Hub**: https://hub.docker.com/u/r3cicle

**Sistema dockerizado com sucesso! 🐳✨**