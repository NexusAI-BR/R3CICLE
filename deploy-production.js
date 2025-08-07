#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Deploy do Sistema ERP de Reciclagem...');
console.log('=' .repeat(60));

// Função para executar comandos
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`\n📋 Executando: ${command}`);
    const result = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return result;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Função para verificar se um comando existe
function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Verificar dependências
console.log('\n🔍 Verificando dependências...');

const dependencies = [
  { name: 'node', command: 'node --version' },
  { name: 'npm', command: 'npm --version' }
];

dependencies.forEach(dep => {
  if (commandExists(dep.name)) {
    console.log(`✅ ${dep.name} instalado`);
    runCommand(dep.command);
  } else {
    console.error(`❌ ${dep.name} não encontrado`);
    process.exit(1);
  }
});

// Verificar estrutura do projeto
console.log('\n📁 Verificando estrutura do projeto...');

const requiredFiles = [
  'frontend/package.json',
  'backend/package.json',
  'backend/.env',
  'vercel.json',
  'railway.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} encontrado`);
  } else {
    console.error(`❌ ${file} não encontrado`);
    process.exit(1);
  }
});

// Testar conexão com Neon.tech
console.log('\n🐘 Testando conexão com Neon.tech...');
try {
  runCommand('npm run test:neon', './backend');
  console.log('✅ Conexão com Neon.tech OK');
} catch (error) {
  console.error('❌ Falha na conexão com Neon.tech');
  console.error('Verifique as configurações no arquivo backend/.env');
  process.exit(1);
}

// Build do frontend
console.log('\n⚛️ Fazendo build do frontend...');
runCommand('npm run build', './frontend');
console.log('✅ Build do frontend concluído');

// Verificar se Vercel CLI está instalado
console.log('\n🌐 Verificando Vercel CLI...');
if (!commandExists('vercel')) {
  console.log('📦 Instalando Vercel CLI...');
  runCommand('npm install -g vercel');
}

// Verificar se Railway CLI está instalado
console.log('\n🚂 Verificando Railway CLI...');
if (!commandExists('railway')) {
  console.log('📦 Instalando Railway CLI...');
  runCommand('npm install -g @railway/cli');
}

// Instruções finais
console.log('\n' + '='.repeat(60));
console.log('🎉 PREPARAÇÃO PARA DEPLOY CONCLUÍDA!');
console.log('='.repeat(60));

console.log('\n📋 PRÓXIMOS PASSOS MANUAIS:');
console.log('\n1. 🌐 DEPLOY DO FRONTEND (Vercel):');
console.log('   • Execute: vercel login');
console.log('   • Execute: vercel --prod');
console.log('   • OU acesse: https://vercel.com e importe o repositório');

console.log('\n2. 🚂 DEPLOY DO BACKEND (Railway):');
console.log('   • Execute: railway login');
console.log('   • Execute: railway up');
console.log('   • OU acesse: https://railway.app e importe o repositório');

console.log('\n3. 🔧 CONFIGURAÇÕES PÓS-DEPLOY:');
console.log('   • Atualize CORS_ORIGIN no Railway com a URL do Vercel');
console.log('   • Teste os endpoints da API');
console.log('   • Verifique o funcionamento completo');

console.log('\n📚 DOCUMENTAÇÃO COMPLETA:');
console.log('   • Consulte: DEPLOY_MANUAL.md');
console.log('   • Consulte: DEPLOY_FINAL.md');

console.log('\n🌱 Sistema ERP de Reciclagem pronto para produção!');
console.log('='.repeat(60));

// Mostrar informações do sistema
console.log('\n📊 INFORMAÇÕES DO SISTEMA:');
console.log(`   • Frontend: React (build pronto)`);
console.log(`   • Backend: Node.js + Express`);
console.log(`   • Banco: PostgreSQL (Neon.tech)`);
console.log(`   • Deploy: Vercel + Railway`);

// Verificar se há atualizações pendentes
console.log('\n🔄 Verificando atualizações...');
try {
  runCommand('npm outdated', './frontend');
} catch {
  console.log('✅ Dependências do frontend atualizadas');
}

try {
  runCommand('npm outdated', './backend');
} catch {
  console.log('✅ Dependências do backend atualizadas');
}

console.log('\n✨ Deploy preparation completed successfully!');