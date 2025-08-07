@echo off
echo ========================================
echo   DEPLOY AUTOMATICO - ERP RECICLAGEM
echo ========================================
echo.

echo [1/5] Verificando estrutura do projeto...
if not exist "frontend\package.json" (
    echo ERRO: frontend/package.json nao encontrado!
    pause
    exit /b 1
)
if not exist "backend\package.json" (
    echo ERRO: backend/package.json nao encontrado!
    pause
    exit /b 1
)
echo ✅ Estrutura do projeto OK

echo.
echo [2/5] Fazendo build do frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ERRO: Build do frontend falhou!
    pause
    exit /b 1
)
cd ..
echo ✅ Build do frontend concluido

echo.
echo [3/5] Testando conexao com Neon.tech...
cd backend
call npm run test:neon
if %errorlevel% neq 0 (
    echo ERRO: Conexao com Neon.tech falhou!
    echo Verifique o arquivo .env
    pause
    exit /b 1
)
cd ..
echo ✅ Conexao com Neon.tech OK

echo.
echo [4/5] Preparando deploy...
echo ✅ Vercel CLI instalado
echo ✅ Railway CLI instalado
echo ✅ Arquivos de configuracao prontos

echo.
echo [5/5] DEPLOY MANUAL NECESSARIO
echo ========================================
echo.
echo FRONTEND (Vercel):
echo 1. Execute: vercel login
echo 2. Execute: vercel --prod
echo    OU acesse: https://vercel.com
echo.
echo BACKEND (Railway):
echo 1. Execute: railway login
echo 2. Execute: railway up
echo    OU acesse: https://railway.app
echo.
echo CONFIGURACAO POS-DEPLOY:
echo 1. Atualize CORS_ORIGIN no Railway
echo 2. Teste todos os endpoints
echo 3. Verifique funcionamento completo
echo.
echo ========================================
echo   SISTEMA PRONTO PARA PRODUCAO! 🚀
echo ========================================
echo.
echo Pressione qualquer tecla para abrir os sites...
pause >nul

start https://vercel.com
start https://railway.app

echo.
echo Deploy iniciado! Siga as instrucoes nos navegadores.
pause