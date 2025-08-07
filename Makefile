# R3CICLE ERP - Docker Makefile

# Variáveis
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
PROJECT_NAME = r3cicle

# Cores
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help build start stop restart dev logs status clean backup restore

# Default target
help: ## Mostrar esta ajuda
	@echo "$(BLUE)R3CICLE ERP - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build de todas as imagens
	@echo "$(BLUE)🔨 Building all images...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✅ Build completed!$(NC)"

start: ## Iniciar sistema em produção
	@echo "$(BLUE)🚀 Starting production environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ System started! Access: http://localhost:3000$(NC)"

stop: ## Parar todos os containers
	@echo "$(YELLOW)⏹️ Stopping all containers...$(NC)"
	docker-compose down
	docker-compose -f $(COMPOSE_DEV_FILE) down 2>/dev/null || true
	@echo "$(GREEN)✅ Containers stopped$(NC)"

restart: stop start ## Reiniciar sistema

dev: ## Iniciar ambiente de desenvolvimento
	@echo "$(BLUE)🛠️ Starting development environment...$(NC)"
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "$(GREEN)✅ Development started! Access: http://localhost:3001$(NC)"

logs: ## Ver logs em tempo real
	@echo "$(BLUE)📋 Showing logs...$(NC)"
	docker-compose logs -f

logs-backend: ## Ver logs apenas do backend
	@echo "$(BLUE)📋 Showing backend logs...$(NC)"
	docker-compose logs -f backend

logs-frontend: ## Ver logs apenas do frontend
	@echo "$(BLUE)📋 Showing frontend logs...$(NC)"
	docker-compose logs -f frontend

logs-db: ## Ver logs apenas do database
	@echo "$(BLUE)📋 Showing database logs...$(NC)"
	docker-compose logs -f database

status: ## Status dos containers
	@echo "$(BLUE)📊 Container status:$(NC)"
	docker-compose ps

health: ## Health check de todos os serviços
	@echo "$(BLUE)🏥 Health check...$(NC)"
	@echo "Backend:" && curl -s http://localhost:5000/api/health | jq . || echo "❌ Backend not responding"
	@echo "Frontend:" && curl -s -o /dev/null -w "Status: %{http_code}" http://localhost:3000 && echo " ✅" || echo " ❌"

shell-backend: ## Shell no container backend
	docker exec -it r3cicle_api /bin/sh

shell-frontend: ## Shell no container frontend
	docker exec -it r3cicle_web /bin/sh

shell-db: ## Shell no PostgreSQL
	docker exec -it r3cicle_db psql -U r3cicle_user -d r3cicle

backup: ## Backup do banco de dados
	@echo "$(BLUE)💾 Creating database backup...$(NC)"
	@mkdir -p backups
	docker exec r3cicle_db pg_dump -U r3cicle_user -d r3cicle > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup created in backups/ directory$(NC)"

restore: ## Restaurar último backup (make restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Please specify backup file: make restore FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)📥 Restoring database from $(FILE)...$(NC)"
	docker exec -i r3cicle_db psql -U r3cicle_user -d r3cicle < $(FILE)
	@echo "$(GREEN)✅ Database restored$(NC)"

migrate: ## Executar migrações do banco
	@echo "$(BLUE)🔄 Running database migrations...$(NC)"
	docker exec r3cicle_db psql -U r3cicle_user -d r3cicle -f /docker-entrypoint-initdb.d/init.sql
	@echo "$(GREEN)✅ Migrations completed$(NC)"

test: ## Executar testes
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	docker-compose exec backend npm test
	docker-compose exec frontend npm test -- --watchAll=false

clean: ## Limpar containers, volumes e imagens
	@echo "$(YELLOW)🧹 Cleaning up...$(NC)"
	@echo "$(RED)⚠️ This will remove all containers, volumes and images!$(NC)"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker system prune -af --volumes
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

reset: clean build start ## Reset completo: limpar + build + start

update: ## Atualizar e rebuild
	@echo "$(BLUE)🔄 Updating and rebuilding...$(NC)"
	git pull
	docker-compose build --no-cache
	$(MAKE) restart
	@echo "$(GREEN)✅ Update completed$(NC)"

install: ## Setup inicial completo
	@echo "$(BLUE)🚀 Initial setup...$(NC)"
	@echo "Checking Docker..."
	@docker --version || (echo "$(RED)❌ Docker not found$(NC)" && exit 1)
	@echo "Checking Docker Compose..."
	@docker-compose --version || (echo "$(RED)❌ Docker Compose not found$(NC)" && exit 1)
	$(MAKE) build
	$(MAKE) start
	@echo "$(GREEN)✅ Setup completed! System running at http://localhost:3000$(NC)"

# Monitoring targets
monitoring: ## Iniciar stack de monitoring (Prometheus + Grafana)
	@echo "$(BLUE)📊 Starting monitoring stack...$(NC)"
	docker-compose -f docker-compose.monitoring.yml up -d
	@echo "$(GREEN)✅ Monitoring available at:$(NC)"
	@echo "  - Grafana: http://localhost:3001"
	@echo "  - Prometheus: http://localhost:9090"

# Production helpers
prod-deploy: ## Deploy para produção
	@echo "$(BLUE)🚀 Production deployment...$(NC)"
	git pull
	$(MAKE) build
	$(MAKE) start
	$(MAKE) health
	@echo "$(GREEN)✅ Production deployment completed$(NC)"

prod-backup: ## Backup para produção com timestamp
	@echo "$(BLUE)💾 Production backup...$(NC)"
	@mkdir -p /backups/r3cicle
	docker exec r3cicle_db pg_dump -U r3cicle_user -d r3cicle | gzip > /backups/r3cicle/backup_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "$(GREEN)✅ Production backup completed$(NC)"

# Development helpers
dev-reset: ## Reset ambiente de desenvolvimento
	docker-compose -f $(COMPOSE_DEV_FILE) down -v
	docker-compose -f $(COMPOSE_DEV_FILE) build --no-cache
	$(MAKE) dev

# Quick commands
up: start ## Alias para start
down: stop ## Alias para stop
ps: status ## Alias para status