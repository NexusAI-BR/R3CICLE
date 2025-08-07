const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err);
  } else {
    console.log('Conectado ao SQLite');
  }
});

// Criação de tabelas básicas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS materiais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT,
    preco REAL,
    unidade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    tipo TEXT,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    descricao TEXT,
    valor REAL,
    categoria TEXT,
    data TEXT,
    status TEXT DEFAULT 'pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS compliance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    nome TEXT NOT NULL,
    numero TEXT NOT NULL,
    orgao_emissor TEXT NOT NULL,
    data_emissao TEXT NOT NULL,
    data_vencimento TEXT NOT NULL,
    status TEXT DEFAULT 'ativo',
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Rota básica
app.get('/', (req, res) => {
  res.send('API do Projeto de Reciclagem ativa!');
});

// Endpoint para KPIs do dashboard
app.get('/api/dashboard/kpis', (req, res) => {
  try {
    // Buscar dados dos KPIs
    const materiaisStmt = db.prepare('SELECT COUNT(*) as count FROM materiais');
    const materiaisCount = materiaisStmt.get();
    
    const fornecedoresStmt = db.prepare('SELECT COUNT(*) as count FROM fornecedores WHERE status = "ativo"');
    const fornecedoresCount = fornecedoresStmt.get();
    
    const receitaStmt = db.prepare('SELECT SUM(valor) as total FROM financeiro WHERE tipo = "receita" AND strftime("%Y-%m", date(data)) = strftime("%Y-%m", date("now"))');
    const receitaTotal = receitaStmt.get();
    
    const transacoesStmt = db.prepare('SELECT * FROM financeiro ORDER BY created_at DESC LIMIT 5');
    const transacoes = transacoesStmt.all();
    
    const alertasStmt = db.prepare('SELECT * FROM compliance WHERE date(data_vencimento) <= date("now", "+30 days") AND status = "ativo" ORDER BY data_vencimento ASC LIMIT 5');
    const alertas = alertasStmt.all();
    
    const kpis = {
      materiaisCadastrados: materiaisCount?.count || 0,
      receitaMensal: receitaTotal?.total || 0,
      fornecedoresAtivos: fornecedoresCount?.count || 0,
      valorEstoque: 15000, // Valor fixo por enquanto
      transacoesRecentes: transacoes || [],
      alertas: alertas || []
    };
    
    res.json(kpis);
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});

// Manter o processo ativo
process.on('SIGINT', () => {
  console.log('\nEncerrando servidor...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nEncerrando servidor...');
  server.close(() => {
    db.close();
    process.exit(0);
  });
});