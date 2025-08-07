#!/bin/bash

# R3CICLE ERP - Docker Management Scripts

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se Docker está rodando
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker não está rodando. Inicie o Docker Desktop primeiro."
        exit 1
    fi
    log_success "Docker está rodando"
}

# Função para build de todas as imagens
build_all() {
    log_info "🔨 Fazendo build de todas as imagens..."
    check_docker
    
    log_info "Building backend..."
    docker build -t r3cicle-backend ./backend
    
    log_info "Building frontend..."
    docker build -t r3cicle-frontend ./frontend
    
    log_success "Build completo!"
}

# Função para iniciar em produção
start_production() {
    log_info "🚀 Iniciando R3CICLE em modo produção..."
    check_docker
    docker-compose up -d
    log_success "Sistema iniciado! Acesse http://localhost:3000"
}

# Função para iniciar em desenvolvimento
start_development() {
    log_info "🛠️ Iniciando R3CICLE em modo desenvolvimento..."
    check_docker
    docker-compose -f docker-compose.dev.yml up -d
    log_success "Sistema de desenvolvimento iniciado! Acesse http://localhost:3001"
}

# Função para parar todos os containers
stop_all() {
    log_info "⏹️ Parando todos os containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    log_success "Containers parados"
}

# Função para reiniciar
restart_production() {
    log_info "🔄 Reiniciando sistema..."
    stop_all
    start_production
}

# Função para visualizar logs
show_logs() {
    log_info "📋 Mostrando logs do sistema..."
    docker-compose logs -f
}

# Função para limpar volumes e imagens
clean_all() {
    log_warning "🧹 Limpando volumes, imagens e containers..."
    read -p "Tem certeza? Isso vai apagar todos os dados! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        docker system prune -af --volumes
        log_success "Limpeza completa realizada"
    else
        log_info "Limpeza cancelada"
    fi
}

# Função para backup do banco
backup_database() {
    log_info "💾 Fazendo backup do banco de dados..."
    docker exec r3cicle_db pg_dump -U r3cicle_user -d r3cicle > "backup_$(date +%Y%m%d_%H%M%S).sql"
    log_success "Backup salvo como backup_$(date +%Y%m%d_%H%M%S).sql"
}

# Função para restaurar backup
restore_database() {
    if [ -z "$1" ]; then
        log_error "Use: $0 restore <arquivo_backup.sql>"
        exit 1
    fi
    
    log_info "📥 Restaurando backup do banco de dados..."
    docker exec -i r3cicle_db psql -U r3cicle_user -d r3cicle < "$1"
    log_success "Backup restaurado com sucesso"
}

# Função para mostrar status
show_status() {
    log_info "📊 Status dos containers:"
    docker-compose ps
}

# Função de ajuda
show_help() {
    echo "R3CICLE ERP - Docker Management"
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build       - Build de todas as imagens"
    echo "  start       - Iniciar em modo produção"
    echo "  dev         - Iniciar em modo desenvolvimento"
    echo "  stop        - Parar todos os containers"
    echo "  restart     - Reiniciar sistema"
    echo "  logs        - Ver logs em tempo real"
    echo "  status      - Status dos containers"
    echo "  backup      - Backup do banco de dados"
    echo "  restore     - Restaurar backup (requer arquivo)"
    echo "  clean       - Limpar tudo (CUIDADO!)"
    echo "  help        - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start"
    echo "  $0 dev"
    echo "  $0 restore backup_20240101_120000.sql"
}

# Main script
case "$1" in
    build)
        build_all
        ;;
    start|production)
        start_production
        ;;
    dev|development)
        start_development
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_production
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    clean)
        clean_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Comando inválido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac