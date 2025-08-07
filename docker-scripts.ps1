# R3CICLE ERP - Docker Management Scripts (PowerShell)

param(
    [Parameter(Mandatory=$false)]
    [string]$Command,
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

# Cores para output
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Blue }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Verificar se Docker está rodando
function Test-Docker {
    try {
        docker info | Out-Null
        Write-Success "Docker está rodando"
        return $true
    }
    catch {
        Write-Error "Docker não está rodando. Inicie o Docker Desktop primeiro."
        return $false
    }
}

# Build de todas as imagens
function Build-All {
    Write-Info "🔨 Fazendo build de todas as imagens..."
    if (-not (Test-Docker)) { return }
    
    Write-Info "Building backend..."
    docker build -t r3cicle-backend ./backend
    
    Write-Info "Building frontend..."  
    docker build -t r3cicle-frontend ./frontend
    
    Write-Success "Build completo!"
}

# Iniciar em produção
function Start-Production {
    Write-Info "🚀 Iniciando R3CICLE em modo produção..."
    if (-not (Test-Docker)) { return }
    
    docker-compose up -d
    Write-Success "Sistema iniciado! Acesse http://localhost:3000"
}

# Iniciar em desenvolvimento
function Start-Development {
    Write-Info "🛠️ Iniciando R3CICLE em modo desenvolvimento..."
    if (-not (Test-Docker)) { return }
    
    docker-compose -f docker-compose.dev.yml up -d
    Write-Success "Sistema de desenvolvimento iniciado! Acesse http://localhost:3001"
}

# Parar todos os containers
function Stop-All {
    Write-Info "⏹️ Parando todos os containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    Write-Success "Containers parados"
}

# Reiniciar sistema
function Restart-Production {
    Write-Info "🔄 Reiniciando sistema..."
    Stop-All
    Start-Production
}

# Mostrar logs
function Show-Logs {
    Write-Info "📋 Mostrando logs do sistema..."
    docker-compose logs -f
}

# Limpar tudo
function Clean-All {
    Write-Warning "🧹 Limpando volumes, imagens e containers..."
    $confirmation = Read-Host "Tem certeza? Isso vai apagar todos os dados! (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker-compose down -v
        docker system prune -af --volumes
        Write-Success "Limpeza completa realizada"
    } else {
        Write-Info "Limpeza cancelada"
    }
}

# Backup do banco
function Backup-Database {
    Write-Info "💾 Fazendo backup do banco de dados..."
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"
    
    docker exec r3cicle_db pg_dump -U r3cicle_user -d r3cicle | Out-File -FilePath $backupFile -Encoding UTF8
    Write-Success "Backup salvo como $backupFile"
}

# Restaurar backup
function Restore-Database {
    param([string]$BackupFile)
    
    if (-not $BackupFile) {
        Write-Error "Use: .\docker-scripts.ps1 restore -BackupFile arquivo_backup.sql"
        return
    }
    
    if (-not (Test-Path $BackupFile)) {
        Write-Error "Arquivo de backup não encontrado: $BackupFile"
        return
    }
    
    Write-Info "📥 Restaurando backup do banco de dados..."
    Get-Content $BackupFile | docker exec -i r3cicle_db psql -U r3cicle_user -d r3cicle
    Write-Success "Backup restaurado com sucesso"
}

# Status dos containers
function Show-Status {
    Write-Info "📊 Status dos containers:"
    docker-compose ps
}

# Ajuda
function Show-Help {
    Write-Host "R3CICLE ERP - Docker Management (PowerShell)" -ForegroundColor Cyan
    Write-Host "Uso: .\docker-scripts.ps1 [COMANDO]" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
    Write-Host "  build       - Build de todas as imagens"
    Write-Host "  start       - Iniciar em modo produção"  
    Write-Host "  dev         - Iniciar em modo desenvolvimento"
    Write-Host "  stop        - Parar todos os containers"
    Write-Host "  restart     - Reiniciar sistema"
    Write-Host "  logs        - Ver logs em tempo real"
    Write-Host "  status      - Status dos containers"
    Write-Host "  backup      - Backup do banco de dados"
    Write-Host "  restore     - Restaurar backup"
    Write-Host "  clean       - Limpar tudo (CUIDADO!)"
    Write-Host "  help        - Mostrar esta ajuda"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Green
    Write-Host "  .\docker-scripts.ps1 start"
    Write-Host "  .\docker-scripts.ps1 dev"
    Write-Host "  .\docker-scripts.ps1 restore -BackupFile backup_20240101_120000.sql"
}

# Main script
switch ($Command.ToLower()) {
    "build" { Build-All }
    "start" { Start-Production }
    "production" { Start-Production }
    "dev" { Start-Development }
    "development" { Start-Development }
    "stop" { Stop-All }
    "restart" { Restart-Production }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "backup" { Backup-Database }
    "restore" { Restore-Database -BackupFile $BackupFile }
    "clean" { Clean-All }
    "help" { Show-Help }
    "" { Show-Help }
    default {
        Write-Error "Comando inválido: $Command"
        Write-Host ""
        Show-Help
    }
}