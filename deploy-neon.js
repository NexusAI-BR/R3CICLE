#!/usr/bin/env node

/**
 * Script de Deploy para Neon.tech
 * 
 * Este script automatiza o processo de deploy do Sistema ERP de Reciclagem
 * utilizando Neon.tech como banco de dados PostgreSQL.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando deploy para Neon.tech...');

// Verificar se o arquivo .env.neon existe
const envNeonPath = path.join(__dirname, 'backend', '.env.neon');
if (!fs.existsSync(envNeonPath)) {
  console.error('❌ Arquivo .env.neon não encontrado!');
  console.log('📝 Crie o arquivo backend/.env.neon com suas configurações.');
  process.exit(1);
}

// Verificar se a dependência pg está instalada
try {
  require.resolve('pg');
  console.log('✅ Dependência pg encontrada');
} catch (error) {
  console.log('📦 Instalando dependência pg...');
  try {
    execSync('npm install pg', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
    console.log('✅ Dependência pg instalada com sucesso');
  } catch (installError) {
    console.error('❌ Erro ao instalar dependência pg:', installError.message);
    process.exit(1);
  }
}

// Função para executar comandos
function runCommand(command, cwd = __dirname) {
  try {
    console.log(`🔧 Executando: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Passo 1: Build do Frontend
console.log('\n📦 Fazendo build do frontend...');
if (!runCommand('npm run build', path.join(__dirname, 'frontend'))) {
  console.error('❌ Falha no build do frontend');
  process.exit(1);
}
console.log('✅ Build do frontend concluído');

// Passo 2: Preparar Backend
console.log('\n🔧 Preparando backend...');

// Copiar arquivo de configuração
const envPath = path.join(__dirname, 'backend', '.env');
const envNeonContent = fs.readFileSync(envNeonPath, 'utf8');

// Criar backup do .env atual se existir
if (fs.existsSync(envPath)) {
  const backupPath = path.join(__dirname, 'backend', '.env.backup');
  fs.copyFileSync(envPath, backupPath);
  console.log('📋 Backup do .env atual criado');
}

// Copiar configurações do Neon
fs.writeFileSync(envPath, envNeonContent);
console.log('✅ Configurações do Neon aplicadas');

// Passo 3: Instalar dependências de produção
console.log('\n📦 Instalando dependências de produção...');
if (!runCommand('npm ci --only=production', path.join(__dirname, 'backend'))) {
  console.error('❌ Falha na instalação das dependências');
  process.exit(1);
}

// Passo 4: Testar conexão com Neon
console.log('\n🔍 Testando conexão com Neon.tech...');
try {
  const testScript = `
    const { Pool } = require('pg');
    require('dotenv').config();
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    pool.query('SELECT NOW()', (err, result) => {
      if (err) {
        console.error('❌ Erro de conexão:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Conexão com Neon.tech estabelecida:', result.rows[0].now);
        process.exit(0);
      }
    });
  `;
  
  fs.writeFileSync(path.join(__dirname, 'backend', 'test-connection.js'), testScript);
  runCommand('node test-connection.js', path.join(__dirname, 'backend'));
  fs.unlinkSync(path.join(__dirname, 'backend', 'test-connection.js'));
} catch (error) {
  console.error('❌ Erro ao testar conexão:', error.message);
}

// Passo 5: Instruções finais
console.log('\n🎉 Preparação para deploy concluída!');
console.log('\n📋 Próximos passos:');
console.log('\n1. 🌐 Deploy do Frontend (Vercel):');
console.log('   - Conecte seu repositório ao Vercel');
console.log('   - Configure o diretório de build: frontend/build');
console.log('   - Deploy automático será feito');

console.log('\n2. 🚀 Deploy do Backend (Railway):');
console.log('   - Conecte seu repositório ao Railway');
console.log('   - Configure as variáveis de ambiente do .env.neon');
console.log('   - Railway detectará automaticamente o Dockerfile');

console.log('\n3. 🔧 Configurações importantes:');
console.log('   - Atualize FRONTEND_URL no .env.neon com a URL do Vercel');
console.log('   - Verifique se DATABASE_URL está correto');
console.log('   - Configure domínio personalizado se necessário');

console.log('\n4. 📊 Monitoramento:');
console.log('   - Health check: https://seu-backend.railway.app/api/health');
console.log('   - Logs: Railway Dashboard > Deployments > Logs');

console.log('\n📚 Documentação completa: NEON_DEPLOY.md');
console.log('\n✨ Sistema ERP de Reciclagem pronto para produção!');