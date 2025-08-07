const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para produção...');

// Função para executar comandos
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Executando: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`Erro ao executar: ${command}`);
    process.exit(1);
  }
}

// Build do Frontend
console.log('\n📦 Fazendo build do frontend...');
runCommand('npm install', './frontend');
runCommand('npm run build', './frontend');

// Preparar Backend
console.log('\n🔧 Preparando backend...');
runCommand('npm install --production', './backend');

// Criar arquivo de saúde para healthcheck
const healthCheckContent = `
// Endpoint de saúde para monitoramento
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});
`;

// Verificar se o endpoint de saúde já existe
const backendIndexPath = './backend/index.js';
const backendContent = fs.readFileSync(backendIndexPath, 'utf8');

if (!backendContent.includes('/api/health')) {
  console.log('\n🏥 Adicionando endpoint de saúde...');
  // Adicionar antes da última linha (app.listen)
  const lines = backendContent.split('\n');
  const lastLineIndex = lines.findIndex(line => line.includes('app.listen'));
  
  if (lastLineIndex > -1) {
    lines.splice(lastLineIndex, 0, healthCheckContent);
    fs.writeFileSync(backendIndexPath, lines.join('\n'));
  }
}

console.log('\n✅ Build concluído com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Frontend: Deploy no Vercel usando o arquivo vercel.json');
console.log('2. Backend: Deploy no Railway usando o Dockerfile');
console.log('3. Configurar variáveis de ambiente conforme .env.example');
console.log('4. Atualizar FRONTEND_URL no backend para a URL do Vercel');