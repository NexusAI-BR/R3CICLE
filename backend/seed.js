const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err);
    return;
  }
  console.log('Conectado ao SQLite para inserir dados de teste');
});

// Criar tabelas primeiro
db.serialize(() => {
  // Criar tabelas
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
  
  console.log('Tabelas criadas com sucesso!');
  
  // Inserir dados de teste
  // Materiais
  const materiaisStmt = db.prepare('INSERT OR IGNORE INTO materiais (nome, categoria, preco, unidade) VALUES (?, ?, ?, ?)');
  materiaisStmt.run('Papel', 'Reciclável', 0.50, 'kg');
  materiaisStmt.run('Plástico', 'Reciclável', 1.20, 'kg');
  materiaisStmt.run('Metal', 'Reciclável', 2.80, 'kg');
  materiaisStmt.run('Vidro', 'Reciclável', 0.80, 'kg');
  materiaisStmt.finalize();
  
  // Fornecedores
  const fornecedoresStmt = db.prepare('INSERT OR IGNORE INTO fornecedores (nome, email, telefone, endereco, tipo, status) VALUES (?, ?, ?, ?, ?, ?)');
  fornecedoresStmt.run('EcoRecicla Ltda', 'contato@ecorecicla.com', '(11) 9999-1234', 'Rua Verde, 123', 'Reciclagem', 'ativo');
  fornecedoresStmt.run('GreenMaterials', 'vendas@greenmaterials.com', '(11) 8888-5678', 'Av. Sustentável, 456', 'Materiais', 'ativo');
  fornecedoresStmt.run('RecyclePro', 'info@recyclepro.com', '(11) 7777-9012', 'Rua Limpa, 789', 'Equipamentos', 'ativo');
  fornecedoresStmt.finalize();
  
  // Transações financeiras
  const financeiroStmt = db.prepare('INSERT OR IGNORE INTO financeiro (tipo, descricao, valor, categoria, data, status) VALUES (?, ?, ?, ?, ?, ?)');
  financeiroStmt.run('receita', 'Venda de papel reciclado', 1500.00, 'Vendas', '2024-01-15', 'concluido');
  financeiroStmt.run('receita', 'Venda de plástico', 2800.00, 'Vendas', '2024-01-14', 'concluido');
  financeiroStmt.run('despesa', 'Compra de equipamentos', 5000.00, 'Equipamentos', '2024-01-13', 'concluido');
  financeiroStmt.run('receita', 'Venda de metal', 3200.00, 'Vendas', '2024-01-12', 'concluido');
  financeiroStmt.run('receita', 'Venda de vidro', 900.00, 'Vendas', '2024-01-11', 'concluido');
  financeiroStmt.finalize();
  
  // Compliance
  const complianceStmt = db.prepare('INSERT OR IGNORE INTO compliance (tipo, nome, numero, orgao_emissor, data_emissao, data_vencimento, status, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  complianceStmt.run('Licença', 'Licença Ambiental', 'LA-2024-001', 'CETESB', '2024-01-01', '2024-12-31', 'ativo', 'Licença para operação de reciclagem');
  complianceStmt.run('Certificado', 'ISO 14001', 'ISO-14001-2024', 'Bureau Veritas', '2024-01-01', '2024-06-30', 'ativo', 'Certificação ambiental');
  complianceStmt.run('Alvará', 'Alvará de Funcionamento', 'AF-2024-123', 'Prefeitura', '2024-01-01', '2024-03-31', 'ativo', 'Alvará municipal');
  complianceStmt.finalize();
});

// Fechar conexão
db.close((err) => {
  if (err) {
    console.error('Erro ao fechar banco de dados', err);
  } else {
    console.log('Dados de teste inseridos com sucesso!');
  }
});