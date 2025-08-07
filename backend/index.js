const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

// Banco de dados SQLite
const db = new Database('./database.db');
console.log('Conectado ao SQLite');

// Criação de tabelas básicas
const createTables = () => {
  db.exec(`CREATE TABLE IF NOT EXISTS materiais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT,
    preco REAL,
    unidade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    tipo TEXT,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    categoria TEXT,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material TEXT NOT NULL,
    quantidade INTEGER,
    localizacao TEXT,
    lote TEXT,
    dataEntrada TEXT,
    fornecedor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL,
    descricao TEXT,
    valor REAL,
    categoria TEXT,
    data TEXT,
    status TEXT DEFAULT 'pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS compliance (
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
  
  db.exec(`CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_nf INTEGER,
    serie INTEGER DEFAULT 1,
    cliente_id INTEGER,
    cliente_nome TEXT,
    cliente_cpf TEXT,
    valor_total REAL,
    status TEXT DEFAULT 'pendente',
    xml_nfe TEXT,
    chave_acesso TEXT,
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento TEXT,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.exec(`CREATE TABLE IF NOT EXISTS venda_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER,
    produto_id INTEGER,
    produto_nome TEXT,
    quantidade REAL,
    valor_unitario REAL,
    valor_total REAL,
    ncm TEXT,
    cfop TEXT DEFAULT '5102',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES materiais(id)
  )`);

  // Tabela para Compras (NF de Entrada)
  db.exec(`CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_nf INTEGER,
    serie INTEGER DEFAULT 1,
    fornecedor_id INTEGER,
    fornecedor_nome TEXT,
    fornecedor_cnpj TEXT,
    valor_total REAL,
    status TEXT DEFAULT 'pendente',
    xml_nfe TEXT,
    chave_acesso TEXT,
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_entrada DATETIME,
    forma_pagamento TEXT,
    observacoes TEXT,
    tipo_operacao TEXT DEFAULT 'entrada',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela para Itens de Compra
  db.exec(`CREATE TABLE IF NOT EXISTS compra_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id INTEGER,
    produto_id INTEGER,
    produto_nome TEXT,
    quantidade REAL,
    valor_unitario REAL,
    valor_total REAL,
    ncm TEXT,
    cfop TEXT DEFAULT '1102',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras(id),
    FOREIGN KEY (produto_id) REFERENCES materiais(id)
  )`);

  // Tabela para Notas Fiscais (Unificada)
  db.exec(`CREATE TABLE IF NOT EXISTS notas_fiscais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_nf INTEGER,
    serie INTEGER DEFAULT 1,
    modelo TEXT DEFAULT '55', -- '55' para NF-e, '65' para NFC-e
    tipo TEXT NOT NULL, -- 'entrada' ou 'saida'
    natureza_operacao TEXT,
    parceiro_id INTEGER,
    parceiro_nome TEXT,
    parceiro_documento TEXT,
    parceiro_ie TEXT,
    parceiro_endereco TEXT,
    parceiro_cidade TEXT,
    parceiro_uf TEXT,
    parceiro_cep TEXT,
    valor_produtos REAL,
    valor_frete REAL DEFAULT 0,
    valor_seguro REAL DEFAULT 0,
    valor_desconto REAL DEFAULT 0,
    valor_outras_despesas REAL DEFAULT 0,
    valor_total REAL,
    valor_icms REAL DEFAULT 0,
    valor_ipi REAL DEFAULT 0,
    valor_pis REAL DEFAULT 0,
    valor_cofins REAL DEFAULT 0,
    status TEXT DEFAULT 'pendente', -- 'pendente', 'autorizada', 'cancelada', 'denegada'
    xml_nfe TEXT,
    chave_acesso TEXT,
    protocolo_autorizacao TEXT,
    data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_autorizacao DATETIME,
    forma_pagamento TEXT,
    observacoes TEXT,
    motivo_cancelamento TEXT,
    tipo_importacao TEXT, -- 'manual', 'xml', 'codigo_barras'
    arquivo_xml_original TEXT,
    danfe_pdf BLOB,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela para Itens das Notas Fiscais
  db.exec(`CREATE TABLE IF NOT EXISTS nf_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nf_id INTEGER,
    produto_id INTEGER,
    produto_nome TEXT,
    produto_codigo TEXT,
    quantidade REAL,
    unidade TEXT,
    valor_unitario REAL,
    valor_total REAL,
    ncm TEXT,
    cfop TEXT,
    cst_icms TEXT,
    cst_ipi TEXT,
    cst_pis TEXT,
    cst_cofins TEXT,
    aliquota_icms REAL DEFAULT 0,
    aliquota_ipi REAL DEFAULT 0,
    aliquota_pis REAL DEFAULT 0,
    aliquota_cofins REAL DEFAULT 0,
    valor_icms REAL DEFAULT 0,
    valor_ipi REAL DEFAULT 0,
    valor_pis REAL DEFAULT 0,
    valor_cofins REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nf_id) REFERENCES notas_fiscais(id),
    FOREIGN KEY (produto_id) REFERENCES materiais(id)
  )`);

  // Tabela para Certificados Digitais
  db.exec(`CREATE TABLE IF NOT EXISTS certificados_digitais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'A1' ou 'A3'
    arquivo_certificado BLOB,
    senha TEXT,
    data_vencimento DATE,
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela para Logs de Comunicação com SEFAZ
  db.exec(`CREATE TABLE IF NOT EXISTS logs_sefaz (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nf_id INTEGER,
    operacao TEXT, -- 'envio', 'consulta', 'cancelamento'
    request_xml TEXT,
    response_xml TEXT,
    status_code INTEGER,
    mensagem TEXT,
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nf_id) REFERENCES notas_fiscais(id)
  )`);

  // Tabela para Configurações da Empresa
  db.exec(`CREATE TABLE IF NOT EXISTS empresa_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    cnpj TEXT NOT NULL,
    inscricao_estadual TEXT,
    inscricao_municipal TEXT,
    endereco TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    cep TEXT,
    telefone TEXT,
    email TEXT,
    regime_tributario TEXT, -- '1' = Simples Nacional, '2' = Simples Nacional - excesso, '3' = Regime Normal
    certificado_id INTEGER,
    ambiente_nfe TEXT DEFAULT 'homologacao', -- 'homologacao' ou 'producao'
    serie_nfe INTEGER DEFAULT 1,
    proximo_numero_nfe INTEGER DEFAULT 1,
    serie_nfce INTEGER DEFAULT 1,
    proximo_numero_nfce INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (certificado_id) REFERENCES certificados_digitais(id)
  )`);
  
  console.log('Tabelas criadas com sucesso!');
};

// Inicializar tabelas
createTables();

// Inserir dados de exemplo
function insertSampleData() {
  // Inserir configuração da empresa
  const insertEmpresa = db.prepare(`INSERT OR IGNORE INTO empresa_config (
    id, razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
    endereco, numero, bairro, cidade, uf, cep, telefone, email, regime_tributario,
    ambiente_nfe, serie_nfe, proximo_numero_nfe, serie_nfce, proximo_numero_nfce
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  insertEmpresa.run(
    1, 'R3CICLA MATERIAIS RECICLAVEIS LTDA', 'R3Cicla', '12.345.678/0001-95',
    '123.456.789.012', '12345678', 'Rua da Reciclagem', '123', 'Centro',
    'São Paulo', 'SP', '01000-000', '(11) 3333-4444', 'contato@r3cicla.com.br',
    '1', 'homologacao', 1, 1, 1, 1
  );

  // Inserir clientes de exemplo
  const insertCliente = db.prepare(`INSERT OR IGNORE INTO clientes (id, nome, email, telefone, endereco, categoria, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  insertCliente.run(1, 'João Silva', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123', 'pessoa_fisica', 'ativo');
  insertCliente.run(2, 'Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Rua B, 456', 'pessoa_fisica', 'ativo');
  insertCliente.run(3, 'Empresa ABC Ltda', 'contato@abc.com', '(11) 77777-7777', 'Av. Principal, 789', 'pessoa_juridica', 'ativo');
  
  // Inserir fornecedores de exemplo
  const insertFornecedor = db.prepare(`INSERT OR IGNORE INTO fornecedores (id, nome, email, telefone, endereco, tipo, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  insertFornecedor.run(1, 'Reciclagem Verde Ltda', 'contato@reciclagemverde.com', '(11) 3333-3333', 'Rua das Indústrias, 100', 'pessoa_juridica', 'ativo');
  insertFornecedor.run(2, 'Cooperativa Recicla SP', 'cooperativa@reciclasp.org', '(11) 4444-4444', 'Av. Reciclagem, 200', 'cooperativa', 'ativo');
  insertFornecedor.run(3, 'Materiais Sustentáveis S/A', 'vendas@matsustentavel.com', '(11) 5555-5555', 'Rod. Sustentável, km 15', 'pessoa_juridica', 'ativo');

  // Inserir materiais de exemplo
  const insertMaterial = db.prepare(`INSERT OR IGNORE INTO materiais (id, nome, categoria, preco, unidade) VALUES (?, ?, ?, ?, ?)`);
  insertMaterial.run(1, 'Garrafa PET 500ml', 'plastico', 0.50, 'unidade');
  insertMaterial.run(2, 'Lata de Alumínio', 'metal', 0.30, 'unidade');
  insertMaterial.run(3, 'Papel A4 Reciclado', 'papel', 15.00, 'pacote');
  insertMaterial.run(4, 'Vidro Transparente', 'vidro', 2.00, 'kg');
  insertMaterial.run(5, 'Papelão Ondulado', 'papel', 1.20, 'kg');
  
  console.log('Dados de exemplo inseridos com sucesso!');
}

// Inserir dados após criar tabelas
setTimeout(insertSampleData, 1000);

// Rotas básicas
app.get('/', (req, res) => {
  res.send('API do Projeto de Reciclagem ativa!');
});

// Rotas para Materiais
app.post('/api/materiais', (req, res) => {
  const { nome, categoria, preco, unidade } = req.body;
  
  const stmt = db.prepare('INSERT INTO materiais (nome, categoria, preco, unidade) VALUES (?, ?, ?, ?)');
  const result = stmt.run(nome, categoria, preco, unidade);
  
  res.json({ 
    id: result.lastInsertRowid, 
    nome, 
    categoria, 
    preco, 
    unidade 
  });
});

app.get('/api/materiais', (req, res) => {
  try {
    console.log('Tentando buscar materiais...');
    const materiais = db.prepare('SELECT * FROM materiais').all();
    console.log('Materiais encontrados:', materiais);
    res.json(materiais || []);
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Clientes
app.post('/api/clientes', (req, res) => {
  const { nome, email, telefone, endereco, categoria } = req.body;
  
  const stmt = db.prepare('INSERT INTO clientes (nome, email, telefone, endereco, categoria) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(nome, email, telefone, endereco, categoria);
  
  res.json({ 
    id: result.lastInsertRowid, 
    nome, 
    email, 
    telefone, 
    endereco, 
    categoria 
  });
});

app.get('/api/clientes', (req, res) => {
  try {
    console.log('Tentando buscar clientes...');
    const clientes = db.prepare('SELECT * FROM clientes').all();
    console.log('Clientes encontrados:', clientes);
    res.json(clientes || []);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para Fornecedores
app.post('/api/fornecedores', (req, res) => {
  const { nome, email, telefone, endereco, tipo } = req.body;
  
  const stmt = db.prepare('INSERT INTO fornecedores (nome, email, telefone, endereco, tipo) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(nome, email, telefone, endereco, tipo);
  
  res.json({ 
    id: result.lastInsertRowid, 
    nome, 
    email, 
    telefone, 
    endereco, 
    tipo 
  });
});

app.get('/api/fornecedores', (req, res) => {
  const fornecedores = db.prepare('SELECT * FROM fornecedores').all();
  res.json(fornecedores);
});

// Rotas para Estoque
app.post('/api/estoque', (req, res) => {
  const { material, quantidade, localizacao, lote, dataEntrada, fornecedor } = req.body;
  
  const stmt = db.prepare('INSERT INTO estoque (material, quantidade, localizacao, lote, dataEntrada, fornecedor) VALUES (?, ?, ?, ?, ?, ?)');
  const result = stmt.run(material, quantidade, localizacao, lote, dataEntrada, fornecedor);
  
  res.json({ 
    id: result.lastInsertRowid, 
    material, 
    quantidade, 
    localizacao, 
    lote, 
    dataEntrada, 
    fornecedor 
  });
});

app.get('/api/estoque', (req, res) => {
  const estoque = db.prepare('SELECT * FROM estoque').all();
  res.json(estoque);
});

// Rotas para Financeiro
app.post('/api/financeiro', (req, res) => {
  const { tipo, descricao, valor, categoria, data } = req.body;
  
  const stmt = db.prepare('INSERT INTO financeiro (tipo, descricao, valor, categoria, data) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(tipo, descricao, valor, categoria, data);
  
  res.json({ 
    id: result.lastInsertRowid, 
    tipo, 
    descricao, 
    valor, 
    categoria, 
    data 
  });
});

app.get('/api/financeiro', (req, res) => {
  const financeiro = db.prepare('SELECT * FROM financeiro').all();
  res.json(financeiro);
});

// Rotas para Compliance
app.post('/api/compliance', (req, res) => {
  const { tipo, nome, numero, orgao_emissor, data_emissao, data_vencimento, observacoes } = req.body;
  
  const stmt = db.prepare('INSERT INTO compliance (tipo, nome, numero, orgao_emissor, data_emissao, data_vencimento, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const result = stmt.run(tipo, nome, numero, orgao_emissor, data_emissao, data_vencimento, observacoes);
  
  res.json({ 
    id: result.lastInsertRowid, 
    tipo, 
    nome, 
    numero, 
    orgao_emissor, 
    data_emissao, 
    data_vencimento, 
    observacoes 
  });
});

app.get('/api/compliance', (req, res) => {
  const compliance = db.prepare('SELECT * FROM compliance').all();
  res.json(compliance);
});

// Rotas para Vendas e Notas Fiscais

app.post('/api/vendas', (req, res) => {
  const { cliente_nome, cliente_cpf, itens, forma_pagamento, observacoes } = req.body;
  
  try {
    // Gerar número da NF sequencial
    const ultimaNF = db.prepare('SELECT MAX(numero_nf) as ultimo FROM vendas').get();
    const numeroNF = (ultimaNF.ultimo || 0) + 1;
    
    // Calcular valor total
    const valorTotal = itens.reduce((total, item) => total + item.valor_total, 0);
    
    // Inserir venda
    const vendaStmt = db.prepare(`
      INSERT INTO vendas (numero_nf, cliente_nome, cliente_cpf, valor_total, forma_pagamento, observacoes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const vendaResult = vendaStmt.run(numeroNF, cliente_nome, cliente_cpf, valorTotal, forma_pagamento, observacoes);
    
    // Inserir itens da venda
    const itemStmt = db.prepare(`
      INSERT INTO venda_itens (venda_id, produto_id, produto_nome, quantidade, valor_unitario, valor_total, ncm, cfop) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    itens.forEach(item => {
      itemStmt.run(
        vendaResult.lastInsertRowid,
        item.id,
        item.nome,
        item.quantidade,
        item.preco,
        item.valor_total,
        item.ncm || '39269090',
        '5102'
      );
    });
    
    res.json({
      id: vendaResult.lastInsertRowid,
      numero_nf: numeroNF,
      valor_total: valorTotal,
      status: 'pendente'
    });
    
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/vendas', (req, res) => {
  const vendas = db.prepare(`
    SELECT v.*, 
           COUNT(vi.id) as total_itens
    FROM vendas v
    LEFT JOIN venda_itens vi ON v.id = vi.venda_id
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `).all();
  res.json(vendas);
});

app.get('/api/vendas/:id', (req, res) => {
  const { id } = req.params;
  
  const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(id);
  if (!venda) {
    return res.status(404).json({ error: 'Venda não encontrada' });
  }
  
  const itens = db.prepare('SELECT * FROM venda_itens WHERE venda_id = ?').all(id);
  
  res.json({
    ...venda,
    itens
  });
});

// Rota para emitir NF-e
app.post('/api/vendas/:id/emitir-nfe', (req, res) => {
  const { id } = req.params;
  
  try {
    const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(id);
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    if (venda.status === 'autorizada') {
      return res.status(400).json({ error: 'NF-e já foi emitida para esta venda' });
    }
    
    // Gerar chave de acesso simulada (44 dígitos)
    const chaveAcesso = gerarChaveAcesso(venda.numero_nf, venda.serie || 1);
    
    // Gerar XML simulado da NF-e
    const xmlNFe = gerarXMLNFe(venda, id);
    
    // Atualizar venda com dados da NF-e
    const updateStmt = db.prepare(`
      UPDATE vendas 
      SET status = 'autorizada', chave_acesso = ?, xml_nfe = ?
      WHERE id = ?
    `);
    updateStmt.run(chaveAcesso, xmlNFe, id);
    
    res.json({
      chave_acesso: chaveAcesso,
      status: 'autorizada',
      protocolo: `135${Date.now().toString().slice(-6)}`,
      data_autorizacao: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao emitir NF-e:', error);
    res.status(500).json({ error: 'Erro ao emitir NF-e' });
  }
});

// Rota para cancelar venda
app.post('/api/vendas/:id/cancelar', (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(id);
    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    if (venda.status === 'cancelada') {
      return res.status(400).json({ error: 'Venda já está cancelada' });
    }
    
    const updateStmt = db.prepare(`
      UPDATE vendas 
      SET status = 'cancelada', observacoes = ?
      WHERE id = ?
    `);
    updateStmt.run(`${venda.observacoes || ''} - CANCELADA: ${motivo}`, id);
    
    res.json({
      status: 'cancelada',
      motivo: motivo
    });
    
  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    res.status(500).json({ error: 'Erro ao cancelar venda' });
  }
});

// Funções auxiliares para NF-e
function gerarChaveAcesso(numeroNF, serie) {
  const uf = '35'; // São Paulo
  const anoMes = new Date().toISOString().slice(2, 7).replace('-', '');
  const cnpj = '12345678000195'; // CNPJ fictício
  const modelo = '55'; // NF-e
  const serieFormatada = serie.toString().padStart(3, '0');
  const numeroFormatado = numeroNF.toString().padStart(9, '0');
  const tipoEmissao = '1';
  const codigoNumerico = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  const chave = uf + anoMes + cnpj + modelo + serieFormatada + numeroFormatado + tipoEmissao + codigoNumerico;
  
  // Calcular dígito verificador (simplificado)
  const dv = calcularDVChaveAcesso(chave);
  
  return chave + dv;
}

function calcularDVChaveAcesso(chave) {
  const pesos = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  
  for (let i = 0; i < chave.length; i++) {
    soma += parseInt(chave[i]) * pesos[i];
  }
  
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function gerarXMLNFe(venda, vendaId) {
  const dataAtual = new Date().toISOString();
  const chaveAcesso = gerarChaveAcesso(venda.numero_nf, venda.serie || 1);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</cNF>
        <natOp>Venda de materiais recicláveis</natOp>
        <mod>55</mod>
        <serie>${venda.serie || 1}</serie>
        <nNF>${venda.numero_nf}</nNF>
        <dhEmi>${dataAtual}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${chaveAcesso.slice(-1)}</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>12345678000195</CNPJ>
        <xNome>R3CICLA MATERIAIS RECICLAVEIS LTDA</xNome>
        <enderEmit>
          <xLgr>RUA DA RECICLAGEM</xLgr>
          <nro>123</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>01000000</CEP>
        </enderEmit>
        <IE>123456789</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CPF>${venda.cliente_cpf || '00000000000'}</CPF>
        <xNome>${venda.cliente_nome}</xNome>
        <indIEDest>9</indIEDest>
      </dest>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${venda.valor_total.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${venda.valor_total.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>SP_NFE_PL_008i2</verAplic>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${dataAtual}</dhRecbto>
      <nProt>135${Date.now().toString().slice(-10)}</nProt>
      <digVal>simulado</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
}

// ========== SISTEMA COMPLETO DE NOTAS FISCAIS ==========

// Rotas para Compras (NF de Entrada)
app.post('/api/compras', (req, res) => {
  const { fornecedor_nome, fornecedor_cnpj, itens, forma_pagamento, observacoes } = req.body;
  
  try {
    // Gerar número da NF sequencial para compras
    const ultimaNF = db.prepare('SELECT MAX(numero_nf) as ultimo FROM compras').get();
    const numeroNF = (ultimaNF.ultimo || 0) + 1;
    
    // Calcular valor total
    const valorTotal = itens.reduce((total, item) => total + item.valor_total, 0);
    
    // Inserir compra
    const compraStmt = db.prepare(`
      INSERT INTO compras (numero_nf, fornecedor_nome, fornecedor_cnpj, valor_total, forma_pagamento, observacoes) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const compraResult = compraStmt.run(numeroNF, fornecedor_nome, fornecedor_cnpj, valorTotal, forma_pagamento, observacoes);
    
    // Inserir itens da compra
    const itemStmt = db.prepare(`
      INSERT INTO compra_itens (compra_id, produto_id, produto_nome, quantidade, valor_unitario, valor_total, ncm, cfop) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    itens.forEach(item => {
      itemStmt.run(
        compraResult.lastInsertRowid,
        item.id,
        item.nome,
        item.quantidade,
        item.preco,
        item.valor_total,
        item.ncm || '39269090',
        '1102' // CFOP para entrada
      );
    });
    
    // Atualizar estoque automaticamente
    itens.forEach(item => {
      const estoqueExistente = db.prepare('SELECT * FROM estoque WHERE material = ?').get(item.nome);
      
      if (estoqueExistente) {
        // Atualizar quantidade existente
        db.prepare('UPDATE estoque SET quantidade = quantidade + ? WHERE material = ?')
          .run(item.quantidade, item.nome);
      } else {
        // Criar novo item no estoque
        db.prepare(`
          INSERT INTO estoque (material, quantidade, localizacao, lote, dataEntrada, fornecedor) 
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          item.nome,
          item.quantidade,
          'Depósito Principal',
          `LOTE-${Date.now()}`,
          new Date().toISOString().split('T')[0],
          fornecedor_nome
        );
      }
    });
    
    res.json({
      id: compraResult.lastInsertRowid,
      numero_nf: numeroNF,
      valor_total: valorTotal,
      status: 'pendente',
      tipo: 'entrada'
    });
    
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/compras', (req, res) => {
  const compras = db.prepare(`
    SELECT c.*, 
           COUNT(ci.id) as total_itens
    FROM compras c
    LEFT JOIN compra_itens ci ON c.id = ci.compra_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(compras);
});

app.get('/api/compras/:id', (req, res) => {
  const { id } = req.params;
  
  const compra = db.prepare('SELECT * FROM compras WHERE id = ?').get(id);
  if (!compra) {
    return res.status(404).json({ error: 'Compra não encontrada' });
  }
  
  const itens = db.prepare('SELECT * FROM compra_itens WHERE compra_id = ?').all(id);
  
  res.json({
    ...compra,
    itens
  });
});

// Rota para emitir NF-e de Compra
app.post('/api/compras/:id/emitir-nfe', (req, res) => {
  const { id } = req.params;
  
  try {
    const compra = db.prepare('SELECT * FROM compras WHERE id = ?').get(id);
    if (!compra) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }
    
    if (compra.status === 'autorizada') {
      return res.status(400).json({ error: 'NF-e já foi emitida para esta compra' });
    }
    
    // Gerar chave de acesso simulada (44 dígitos)
    const chaveAcesso = gerarChaveAcesso(compra.numero_nf, compra.serie || 1);
    
    // Gerar XML simulado da NF-e de entrada
    const xmlNFe = gerarXMLNFeEntrada(compra, id);
    
    // Atualizar compra com dados da NF-e
    const updateStmt = db.prepare(`
      UPDATE compras 
      SET status = 'autorizada', 
          xml_nfe = ?, 
          chave_acesso = ?,
          data_entrada = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(xmlNFe, chaveAcesso, id);
    
    res.json({
      success: true,
      chave_acesso: chaveAcesso,
      protocolo: `135${Date.now().toString().slice(-9)}`,
      data_autorizacao: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao emitir NF-e de compra:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para cancelar compra
app.post('/api/compras/:id/cancelar', (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const compra = db.prepare('SELECT * FROM compras WHERE id = ?').get(id);
    if (!compra) {
      return res.status(404).json({ error: 'Compra não encontrada' });
    }
    
    if (compra.status === 'cancelada') {
      return res.status(400).json({ error: 'Compra já está cancelada' });
    }
    
    // Reverter estoque se a compra foi autorizada
    if (compra.status === 'autorizada') {
      const itens = db.prepare('SELECT * FROM compra_itens WHERE compra_id = ?').all(id);
      
      itens.forEach(item => {
        db.prepare('UPDATE estoque SET quantidade = quantidade - ? WHERE material = ?')
          .run(item.quantidade, item.produto_nome);
      });
    }
    
    // Atualizar status da compra
    db.prepare('UPDATE compras SET status = "cancelada", observacoes = ? WHERE id = ?')
      .run(`CANCELADA: ${motivo}`, id);
    
    res.json({ success: true, message: 'Compra cancelada com sucesso' });
    
  } catch (error) {
    console.error('Erro ao cancelar compra:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ========== SISTEMA UNIFICADO DE NOTAS FISCAIS ==========

// Rota para listar todas as notas fiscais (entrada e saída)
app.get('/api/notas-fiscais', (req, res) => {
  try {
    const { tipo, status } = req.query;
    
    let query = `
      SELECT 
        'venda' as tipo,
        v.id,
        v.numero_nf,
        1 as serie,
        v.cliente_nome as parceiro_nome,
        v.cliente_cpf as parceiro_documento,
        v.valor_total,
        v.status,
        v.chave_acesso,
        v.created_at as data_emissao,
        v.forma_pagamento,
        v.observacoes,
        v.created_at,
        COUNT(vi.id) as total_itens
      FROM vendas v
      LEFT JOIN venda_itens vi ON v.id = vi.venda_id
      GROUP BY v.id
      
      UNION ALL
      
      SELECT 
        'compra' as tipo,
        c.id,
        c.numero_nf,
        1 as serie,
        c.fornecedor_nome as parceiro_nome,
        c.fornecedor_cnpj as parceiro_documento,
        c.valor_total,
        c.status,
        c.chave_acesso,
        c.created_at as data_emissao,
        c.forma_pagamento,
        c.observacoes,
        c.created_at,
        COUNT(ci.id) as total_itens
      FROM compras c
      LEFT JOIN compra_itens ci ON c.id = ci.compra_id
      GROUP BY c.id
      
      ORDER BY data_emissao DESC
    `;
    
    let notas = db.prepare(query).all();
    
    // Aplicar filtros se especificados
    if (tipo && tipo !== 'todas') {
      notas = notas.filter(nota => nota.tipo === tipo);
    }
    
    if (status && status !== 'todas') {
      notas = notas.filter(nota => nota.status === status);
    }
    
    res.json(notas);
    
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para estatísticas das notas fiscais
app.get('/api/notas-fiscais/estatisticas', (req, res) => {
  try {
    const vendas = db.prepare('SELECT COUNT(*) as total, SUM(valor_total) as valor FROM vendas').get();
    const compras = db.prepare('SELECT COUNT(*) as total, SUM(valor_total) as valor FROM compras').get();
    
    const vendasPorStatus = db.prepare(`
      SELECT status, COUNT(*) as quantidade, SUM(valor_total) as valor 
      FROM vendas 
      GROUP BY status
    `).all();
    
    const comprasPorStatus = db.prepare(`
      SELECT status, COUNT(*) as quantidade, SUM(valor_total) as valor 
      FROM compras 
      GROUP BY status
    `).all();
    
    res.json({
      vendas: {
        total: vendas.total || 0,
        valor_total: vendas.valor || 0,
        por_status: vendasPorStatus
      },
      compras: {
        total: compras.total || 0,
        valor_total: compras.valor || 0,
        por_status: comprasPorStatus
      },
      resumo: {
        total_notas: (vendas.total || 0) + (compras.total || 0),
        saldo: (vendas.valor || 0) - (compras.valor || 0)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para gerar XML de NF-e de Entrada
function gerarXMLNFeEntrada(compra, compraId) {
  const dataAtual = new Date().toISOString();
  const chaveAcesso = gerarChaveAcesso(compra.numero_nf, compra.serie || 1);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</cNF>
        <natOp>Compra de materiais recicláveis</natOp>
        <mod>55</mod>
        <serie>${compra.serie || 1}</serie>
        <nNF>${compra.numero_nf}</nNF>
        <dhEmi>${dataAtual}</dhEmi>
        <tpNF>0</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${chaveAcesso.slice(-1)}</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>${compra.fornecedor_cnpj || '12345678000195'}</CNPJ>
        <xNome>${compra.fornecedor_nome}</xNome>
        <enderEmit>
          <xLgr>RUA DO FORNECEDOR</xLgr>
          <nro>456</nro>
          <xBairro>INDUSTRIAL</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>02000000</CEP>
        </enderEmit>
        <IE>987654321</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000195</CNPJ>
        <xNome>R3CICLA MATERIAIS RECICLAVEIS LTDA</xNome>
        <enderDest>
          <xLgr>RUA DA RECICLAGEM</xLgr>
          <nro>123</nro>
          <xBairro>CENTRO</xBairro>
          <cMun>3550308</cMun>
          <xMun>SAO PAULO</xMun>
          <UF>SP</UF>
          <CEP>01000000</CEP>
        </enderDest>
        <IE>123456789</IE>
      </dest>
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vNF>${compra.valor_total.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>SP_NFE_PL_008i2</verAplic>
      <chNFe>${chaveAcesso}</chNFe>
      <dhRecbto>${dataAtual}</dhRecbto>
      <nProt>135${Date.now().toString().slice(-9)}</nProt>
      <digVal>HASH_SIMULADO</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
}

// ==================== ROTAS PARA SISTEMA COMPLETO DE NF-e ====================

// Rota para cadastro manual de NF-e de entrada
app.post('/api/nfe/entrada/manual', (req, res) => {
  const {
    numero_nf, serie, modelo, natureza_operacao, fornecedor,
    valor_produtos, valor_frete, valor_seguro, valor_desconto,
    valor_outras_despesas, forma_pagamento, observacoes, itens
  } = req.body;

  try {
    const valor_total = valor_produtos + (valor_frete || 0) + (valor_seguro || 0) + (valor_outras_despesas || 0) - (valor_desconto || 0);
    
    // Gerar chave de acesso
    const chave_acesso = gerarChaveAcesso(numero_nf, serie || 1);
    
    const insertNF = db.prepare(`
      INSERT INTO notas_fiscais (
        numero_nf, serie, modelo, tipo, natureza_operacao,
        parceiro_nome, parceiro_documento, parceiro_ie,
        parceiro_endereco, parceiro_cidade, parceiro_uf, parceiro_cep,
        valor_produtos, valor_frete, valor_seguro, valor_desconto,
        valor_outras_despesas, valor_total, forma_pagamento,
        observacoes, tipo_importacao, chave_acesso, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertNF.run(
      numero_nf, serie || 1, modelo || '55', 'entrada', natureza_operacao,
      fornecedor.nome, fornecedor.documento, fornecedor.ie,
      fornecedor.endereco, fornecedor.cidade, fornecedor.uf, fornecedor.cep,
      valor_produtos, valor_frete || 0, valor_seguro || 0, valor_desconto || 0,
      valor_outras_despesas || 0, valor_total, forma_pagamento,
      observacoes, 'manual', chave_acesso, 'pendente'
    );
    
    const nfId = result.lastInsertRowid;
    
    // Inserir itens
    const insertItem = db.prepare(`
      INSERT INTO nf_itens (
        nf_id, produto_nome, produto_codigo, quantidade, unidade,
        valor_unitario, valor_total, ncm, cfop, cst_icms,
        aliquota_icms, valor_icms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    itens.forEach(item => {
      insertItem.run(
        nfId, item.nome, item.codigo, item.quantidade, item.unidade,
        item.valor_unitario, item.valor_total, item.ncm, item.cfop,
        item.cst_icms, item.aliquota_icms || 0, item.valor_icms || 0
      );
    });
    
    res.json({
      success: true,
      message: 'NF-e de entrada cadastrada com sucesso!',
      nf_id: nfId,
      chave_acesso
    });
    
  } catch (error) {
    console.error('Erro ao cadastrar NF-e:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para importação de XML
app.post('/api/nfe/entrada/importar-xml', (req, res) => {
  const { xmlContent, fileName } = req.body;
  
  try {
    // Aqui seria implementado o parser do XML da NF-e
    // Por enquanto, vamos simular a extração dos dados
    const dadosNFe = parseXMLNFe(xmlContent);
    
    if (!dadosNFe) {
      return res.status(400).json({ error: 'XML inválido ou corrompido' });
    }
    
    // Verificar se a NF-e já existe
    const nfExistente = db.prepare('SELECT id FROM notas_fiscais WHERE chave_acesso = ?').get(dadosNFe.chave_acesso);
    if (nfExistente) {
      return res.status(400).json({ error: 'Esta NF-e já foi importada anteriormente' });
    }
    
    const insertNF = db.prepare(`
      INSERT INTO notas_fiscais (
        numero_nf, serie, modelo, tipo, natureza_operacao,
        parceiro_nome, parceiro_documento, parceiro_ie,
        valor_produtos, valor_total, chave_acesso, xml_nfe,
        arquivo_xml_original, tipo_importacao, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertNF.run(
      dadosNFe.numero, dadosNFe.serie, dadosNFe.modelo, 'entrada',
      dadosNFe.natureza_operacao, dadosNFe.fornecedor.nome,
      dadosNFe.fornecedor.documento, dadosNFe.fornecedor.ie,
      dadosNFe.valor_produtos, dadosNFe.valor_total,
      dadosNFe.chave_acesso, xmlContent, fileName, 'xml', 'autorizada'
    );
    
    const nfId = result.lastInsertRowid;
    
    // Inserir itens
    const insertItem = db.prepare(`
      INSERT INTO nf_itens (
        nf_id, produto_nome, produto_codigo, quantidade, unidade,
        valor_unitario, valor_total, ncm, cfop
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    dadosNFe.itens.forEach(item => {
      insertItem.run(
        nfId, item.nome, item.codigo, item.quantidade, item.unidade,
        item.valor_unitario, item.valor_total, item.ncm, item.cfop
      );
    });
    
    res.json({
      success: true,
      message: 'XML importado com sucesso!',
      nf_id: nfId,
      dados: dadosNFe
    });
    
  } catch (error) {
    console.error('Erro ao importar XML:', error);
    res.status(500).json({ error: 'Erro ao processar XML' });
  }
});

// Rota para leitura de código de barras
app.post('/api/nfe/entrada/codigo-barras', (req, res) => {
  const { codigoBarras } = req.body;
  
  try {
    // Extrair chave de acesso do código de barras
    // Formato: 44 dígitos da chave de acesso
    const chaveAcesso = codigoBarras.substring(0, 44);
    
    if (chaveAcesso.length !== 44) {
      return res.status(400).json({ error: 'Código de barras inválido' });
    }
    
    // Verificar se já existe
    const nfExistente = db.prepare('SELECT * FROM notas_fiscais WHERE chave_acesso = ?').get(chaveAcesso);
    if (nfExistente) {
      return res.status(400).json({ error: 'Esta NF-e já foi cadastrada' });
    }
    
    // Aqui seria feita a consulta na SEFAZ para obter os dados da NF-e
    // Por enquanto, vamos simular
    const dadosNFe = consultarNFeSEFAZ(chaveAcesso);
    
    res.json({
      success: true,
      chave_acesso: chaveAcesso,
      dados: dadosNFe,
      message: 'Código de barras lido com sucesso! Confirme os dados para importar.'
    });
    
  } catch (error) {
    console.error('Erro ao processar código de barras:', error);
    res.status(500).json({ error: 'Erro ao processar código de barras' });
  }
});

// Rota para emissão de NF-e de saída
app.post('/api/nfe/saida/emitir', async (req, res) => {
  const {
    modelo, natureza_operacao, cliente, itens,
    valor_produtos, valor_frete, valor_seguro, valor_desconto,
    valor_outras_despesas, forma_pagamento, observacoes
  } = req.body;
  
  try {
    // Obter configuração da empresa
    const empresa = db.prepare('SELECT * FROM empresa_config WHERE id = 1').get();
    if (!empresa) {
      return res.status(400).json({ error: 'Configuração da empresa não encontrada' });
    }
    
    // Obter próximo número da NF-e
    const proximoNumero = modelo === '65' ? empresa.proximo_numero_nfce : empresa.proximo_numero_nfe;
    const serie = modelo === '65' ? empresa.serie_nfce : empresa.serie_nfe;
    
    const valor_total = valor_produtos + (valor_frete || 0) + (valor_seguro || 0) + (valor_outras_despesas || 0) - (valor_desconto || 0);
    
    // Gerar chave de acesso
    const chave_acesso = gerarChaveAcesso(proximoNumero, serie);
    
    const insertNF = db.prepare(`
      INSERT INTO notas_fiscais (
        numero_nf, serie, modelo, tipo, natureza_operacao,
        parceiro_nome, parceiro_documento, parceiro_ie,
        parceiro_endereco, parceiro_cidade, parceiro_uf, parceiro_cep,
        valor_produtos, valor_frete, valor_seguro, valor_desconto,
        valor_outras_despesas, valor_total, forma_pagamento,
        observacoes, tipo_importacao, chave_acesso, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insertNF.run(
      proximoNumero, serie, modelo, 'saida', natureza_operacao,
      cliente.nome, cliente.documento, cliente.ie || '',
      cliente.endereco, cliente.cidade, cliente.uf, cliente.cep,
      valor_produtos, valor_frete || 0, valor_seguro || 0, valor_desconto || 0,
      valor_outras_despesas || 0, valor_total, forma_pagamento,
      observacoes, 'manual', chave_acesso, 'pendente'
    );
    
    const nfId = result.lastInsertRowid;
    
    // Inserir itens
    const insertItem = db.prepare(`
      INSERT INTO nf_itens (
        nf_id, produto_nome, produto_codigo, quantidade, unidade,
        valor_unitario, valor_total, ncm, cfop, cst_icms,
        aliquota_icms, valor_icms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    itens.forEach(item => {
      insertItem.run(
        nfId, item.nome, item.codigo, item.quantidade, item.unidade,
        item.valor_unitario, item.valor_total, item.ncm, item.cfop,
        item.cst_icms, item.aliquota_icms || 0, item.valor_icms || 0
      );
    });
    
    // Gerar XML da NF-e
    const xmlNFe = gerarXMLNFeSaida({
      numero_nf: proximoNumero,
      serie,
      modelo,
      natureza_operacao,
      valor_total,
      chave_acesso
    }, empresa, cliente, itens);
    
    // Enviar para SEFAZ
    const resultadoSEFAZ = await enviarNFeSEFAZ(xmlNFe, chave_acesso);
    
    if (resultadoSEFAZ.success) {
      // Atualizar NF-e com dados de autorização
      db.prepare(`
        UPDATE notas_fiscais 
        SET status = 'autorizada', xml_nfe = ?, protocolo_autorizacao = ?, data_autorizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(xmlNFe, resultadoSEFAZ.protocolo, nfId);
      
      // Atualizar próximo número
      if (modelo === '65') {
        db.prepare('UPDATE empresa_config SET proximo_numero_nfce = proximo_numero_nfce + 1 WHERE id = 1').run();
      } else {
        db.prepare('UPDATE empresa_config SET proximo_numero_nfe = proximo_numero_nfe + 1 WHERE id = 1').run();
      }
      
      // Log da operação
      db.prepare(`
        INSERT INTO logs_sefaz (nf_id, operacao, request_xml, response_xml, status_code, mensagem)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(nfId, 'envio', xmlNFe, resultadoSEFAZ.response, 200, 'NF-e autorizada com sucesso');
      
      res.json({
        success: true,
        message: 'NF-e emitida e autorizada com sucesso!',
        nf_id: nfId,
        numero_nf: proximoNumero,
        chave_acesso,
        protocolo: resultadoSEFAZ.protocolo,
        xml: xmlNFe
      });
    } else {
      // Erro na SEFAZ
      db.prepare('UPDATE notas_fiscais SET status = ? WHERE id = ?').run('rejeitada', nfId);
      
      res.status(400).json({
        error: 'Erro na SEFAZ: ' + resultadoSEFAZ.message,
        codigo: resultadoSEFAZ.codigo
      });
    }
    
  } catch (error) {
    console.error('Erro ao emitir NF-e:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para cancelar NF-e
app.post('/api/nfe/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  const { motivo } = req.body;
  
  try {
    const nf = db.prepare('SELECT * FROM notas_fiscais WHERE id = ?').get(id);
    if (!nf) {
      return res.status(404).json({ error: 'NF-e não encontrada' });
    }
    
    if (nf.status !== 'autorizada') {
      return res.status(400).json({ error: 'Apenas NF-e autorizadas podem ser canceladas' });
    }
    
    // Cancelar na SEFAZ
    const resultadoCancelamento = await cancelarNFeSEFAZ(nf.chave_acesso, motivo);
    
    if (resultadoCancelamento.success) {
      db.prepare(`
        UPDATE notas_fiscais 
        SET status = 'cancelada', motivo_cancelamento = ?
        WHERE id = ?
      `).run(motivo, id);
      
      // Log da operação
      db.prepare(`
        INSERT INTO logs_sefaz (nf_id, operacao, mensagem)
        VALUES (?, ?, ?)
      `).run(id, 'cancelamento', 'NF-e cancelada com sucesso');
      
      res.json({
        success: true,
        message: 'NF-e cancelada com sucesso!',
        protocolo: resultadoCancelamento.protocolo
      });
    } else {
      res.status(400).json({
        error: 'Erro ao cancelar NF-e: ' + resultadoCancelamento.message
      });
    }
    
  } catch (error) {
    console.error('Erro ao cancelar NF-e:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para consultar NF-e
app.get('/api/nfe/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const nf = db.prepare(`
      SELECT nf.*, 
             GROUP_CONCAT(ni.produto_nome) as produtos
      FROM notas_fiscais nf
      LEFT JOIN nf_itens ni ON nf.id = ni.nf_id
      WHERE nf.id = ?
      GROUP BY nf.id
    `).get(id);
    
    if (!nf) {
      return res.status(404).json({ error: 'NF-e não encontrada' });
    }
    
    const itens = db.prepare('SELECT * FROM nf_itens WHERE nf_id = ?').all(id);
    
    res.json({
      ...nf,
      itens
    });
    
  } catch (error) {
    console.error('Erro ao consultar NF-e:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para gerar DANFE em PDF
app.get('/api/nfe/:id/danfe', (req, res) => {
  const { id } = req.params;
  
  try {
    const nf = db.prepare('SELECT * FROM notas_fiscais WHERE id = ?').get(id);
    if (!nf) {
      return res.status(404).json({ error: 'NF-e não encontrada' });
    }
    
    if (nf.status !== 'autorizada') {
      return res.status(400).json({ error: 'DANFE só pode ser gerado para NF-e autorizadas' });
    }
    
    // Aqui seria implementada a geração do PDF do DANFE
    // Por enquanto, retornamos uma URL simulada
    const urlDANFE = `http://localhost:5000/danfe/${nf.chave_acesso}.pdf`;
    
    res.json({
      success: true,
      url_danfe: urlDANFE,
      chave_acesso: nf.chave_acesso
    });
    
  } catch (error) {
    console.error('Erro ao gerar DANFE:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para consultar logs da SEFAZ
app.get('/api/nfe/logs-sefaz', (req, res) => {
  const { chave_acesso, operacao, status, limit = 50 } = req.query;
  
  try {
    // Verificar se a tabela logs_sefaz existe e tem dados
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='logs_sefaz'").get();
    
    if (!tableExists) {
      return res.json({
        logs: [],
        total: 0
      });
    }
    
    let query = `SELECT l.*, 
                        COALESCE(n.chave_acesso, '') as chave_acesso,
                        CASE 
                          WHEN l.status_code = 200 THEN 'autorizada'
                          WHEN l.status_code = 400 THEN 'rejeitada'
                          WHEN l.status_code = 500 THEN 'erro'
                          ELSE 'pendente'
                        END as status,
                        l.data_operacao as created_at
                 FROM logs_sefaz l 
                 LEFT JOIN notas_fiscais n ON l.nf_id = n.id 
                 WHERE 1=1`;
    const params = [];
    
    if (chave_acesso) {
      query += ' AND n.chave_acesso = ?';
      params.push(chave_acesso);
    }
    
    if (operacao) {
      query += ' AND l.operacao = ?';
      params.push(operacao);
    }
    
    if (status) {
      const statusCode = status === 'autorizada' ? 200 : status === 'rejeitada' ? 400 : 500;
      query += ' AND l.status_code = ?';
      params.push(statusCode);
    }
    
    query += ' ORDER BY l.data_operacao DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const logs = db.prepare(query).all(...params);
    
    res.json({
      logs,
      total: logs.length
    });
    
  } catch (error) {
    console.error('Erro ao consultar logs SEFAZ:', error);
    // Retornar lista vazia em caso de erro
    res.json({
      logs: [],
      total: 0
    });
  }
});

// Rota para listar NF-e com filtros
 app.get('/api/nfe', (req, res) => {
  const { tipo, status, data_inicio, data_fim, page = 1, limit = 50 } = req.query;
  
  try {
    let query = 'SELECT * FROM notas_fiscais WHERE 1=1';
    const params = [];
    
    if (tipo && tipo !== 'todas') {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    
    if (status && status !== 'todas') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (data_inicio) {
      query += ' AND DATE(data_emissao) >= ?';
      params.push(data_inicio);
    }
    
    if (data_fim) {
      query += ' AND DATE(data_emissao) <= ?';
      params.push(data_fim);
    }
    
    query += ' ORDER BY data_emissao DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const notas = db.prepare(query).all(...params);
    
    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM notas_fiscais WHERE 1=1';
    const countParams = [];
    
    if (tipo && tipo !== 'todas') {
      countQuery += ' AND tipo = ?';
      countParams.push(tipo);
    }
    
    if (status && status !== 'todas') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (data_inicio) {
      countQuery += ' AND DATE(data_emissao) >= ?';
      countParams.push(data_inicio);
    }
    
    if (data_fim) {
      countQuery += ' AND DATE(data_emissao) <= ?';
      countParams.push(data_fim);
    }
    
    const { total } = db.prepare(countQuery).get(...countParams);
    
    res.json({
      notas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Erro ao listar NF-e:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== FUNÇÕES AUXILIARES ====================

// Função para parser de XML da NF-e
function parseXMLNFe(xmlContent) {
  // Aqui seria implementado um parser real do XML da NF-e
  // Por enquanto, retornamos dados simulados
  try {
    // Simulação de extração de dados do XML
    return {
      numero: Math.floor(Math.random() * 999999) + 1,
      serie: 1,
      modelo: '55',
      natureza_operacao: 'Venda de materiais recicláveis',
      chave_acesso: gerarChaveAcesso(Math.floor(Math.random() * 999999) + 1, 1),
      fornecedor: {
        nome: 'Fornecedor Simulado Ltda',
        documento: '12.345.678/0001-90',
        ie: '123456789'
      },
      valor_produtos: 1000.00,
      valor_total: 1000.00,
      itens: [
        {
          nome: 'Material Reciclável',
          codigo: '001',
          quantidade: 100,
          unidade: 'KG',
          valor_unitario: 10.00,
          valor_total: 1000.00,
          ncm: '39159000',
          cfop: '1102'
        }
      ]
    };
  } catch (error) {
    return null;
  }
}

// Função para consultar NF-e na SEFAZ
function consultarNFeSEFAZ(chaveAcesso) {
  // Simulação de consulta na SEFAZ
  return {
    numero: Math.floor(Math.random() * 999999) + 1,
    serie: 1,
    fornecedor: {
      nome: 'Fornecedor via Código de Barras',
      documento: '98.765.432/0001-10'
    },
    valor_total: 500.00,
    status: 'Autorizada'
  };
}

// Função para gerar XML da NF-e de saída
function gerarXMLNFeSaida(nf, empresa, cliente, itens) {
  const dataAtual = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe${nf.chave_acesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}</cNF>
        <natOp>${nf.natureza_operacao}</natOp>
        <mod>${nf.modelo}</mod>
        <serie>${nf.serie}</serie>
        <nNF>${nf.numero_nf}</nNF>
        <dhEmi>${dataAtual}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${nf.chave_acesso.slice(-1)}</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
      </ide>
      <emit>
        <CNPJ>${empresa.cnpj.replace(/[^0-9]/g, '')}</CNPJ>
        <xNome>${empresa.razao_social}</xNome>
        <enderEmit>
          <xLgr>${empresa.endereco}</xLgr>
          <nro>${empresa.numero}</nro>
          <xBairro>${empresa.bairro}</xBairro>
          <cMun>3550308</cMun>
          <xMun>${empresa.cidade}</xMun>
          <UF>${empresa.uf}</UF>
          <CEP>${empresa.cep.replace(/[^0-9]/g, '')}</CEP>
        </enderEmit>
        <IE>${empresa.inscricao_estadual}</IE>
        <CRT>${empresa.regime_tributario}</CRT>
      </emit>
      <dest>
        <CNPJ>${cliente.documento.replace(/[^0-9]/g, '')}</CNPJ>
        <xNome>${cliente.nome}</xNome>
        <enderDest>
          <xLgr>${cliente.endereco}</xLgr>
          <nro>S/N</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>${cliente.cidade}</xMun>
          <UF>${cliente.uf}</UF>
          <CEP>${cliente.cep.replace(/[^0-9]/g, '')}</CEP>
        </enderDest>
        <indIEDest>9</indIEDest>
      </dest>
      ${itens.map((item, index) => `
      <det nItem="${index + 1}">
        <prod>
          <cProd>${item.codigo}</cProd>
          <xProd>${item.nome}</xProd>
          <NCM>${item.ncm}</NCM>
          <CFOP>${item.cfop}</CFOP>
          <uCom>${item.unidade}</uCom>
          <qCom>${item.quantidade}</qCom>
          <vUnCom>${item.valor_unitario.toFixed(2)}</vUnCom>
          <vProd>${item.valor_total.toFixed(2)}</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${item.valor_total.toFixed(2)}</vBC>
              <pICMS>${item.aliquota_icms || 0}</pICMS>
              <vICMS>${item.valor_icms || 0}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>`).join('')}
      <total>
        <ICMSTot>
          <vBC>0.00</vBC>
          <vICMS>0.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>${nf.valor_total.toFixed(2)}</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>0.00</vPIS>
          <vCOFINS>0.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>${nf.valor_total.toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
  <protNFe>
    <infProt>
      <tpAmb>2</tpAmb>
      <verAplic>SP_NFE_PL_008i2</verAplic>
      <chNFe>${nf.chave_acesso}</chNFe>
      <dhRecbto>${dataAtual}</dhRecbto>
      <nProt>135${Date.now().toString().slice(-10)}</nProt>
      <digVal>simulado</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
}

// Função para enviar NF-e para SEFAZ
// Função para enviar NF-e para SEFAZ (estrutura preparada para integração real)
async function enviarNFeSEFAZ(xmlNFe, chaveAcesso, uf = 'SP') {
  try {
    // Log da operação
    console.log(`🔄 Enviando NF-e para SEFAZ-${uf}:`, chaveAcesso);
    
    // Validações básicas antes do envio
    if (!xmlNFe || !chaveAcesso) {
      throw new Error('XML ou chave de acesso inválidos');
    }
    
    if (chaveAcesso.length !== 44) {
      throw new Error('Chave de acesso deve ter 44 dígitos');
    }
    
    // Simulação de validação XML
    if (!xmlNFe.includes('<infNFe') || !xmlNFe.includes('</NFe>')) {
      throw new Error('Estrutura XML inválida');
    }
    
    // Registrar log inicial (buscar nf_id pela chave de acesso)
    const nfRecord = db.prepare('SELECT id FROM notas_fiscais WHERE chave_acesso = ?').get(chaveAcesso);
    const nfId = nfRecord ? nfRecord.id : null;
    
    const logStmt = db.prepare(`
      INSERT INTO logs_sefaz (nf_id, operacao, status_code, mensagem, data_operacao)
      VALUES (?, 'envio', 0, 'Enviando para SEFAZ', datetime('now'))
    `);
    logStmt.run(nfId);
    
    // Simulação de envio para SEFAZ com diferentes cenários
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular diferentes respostas baseadas na chave
    const ultimoDigito = parseInt(chaveAcesso.slice(-1));
    let resultado;
    
    if (ultimoDigito === 0) {
      // Simular rejeição
      resultado = {
        success: false,
        status: 'rejeitada',
        codigo: '539',
        protocolo: null,
        data_autorizacao: null,
        message: 'Rejeição: CNPJ do emitente não habilitado para emissão de NF-e',
        response: '<retEnviNFe><cStat>539</cStat><xMotivo>CNPJ do emitente não habilitado para emissão de NF-e</xMotivo></retEnviNFe>'
      };
    } else if (ultimoDigito === 1) {
      // Simular denegação
      resultado = {
        success: false,
        status: 'denegada',
        codigo: '302',
        protocolo: `302${Date.now().toString().slice(-10)}`,
        data_autorizacao: new Date().toISOString(),
        message: 'Uso Denegado: Irregularidade fiscal do emitente',
        response: '<retEnviNFe><cStat>302</cStat><xMotivo>Uso Denegado: Irregularidade fiscal do emitente</xMotivo></retEnviNFe>'
      };
    } else {
      // Simular autorização (caso normal)
      resultado = {
        success: true,
        status: 'autorizada',
        codigo: '100',
        protocolo: `135${Date.now().toString().slice(-10)}`,
        data_autorizacao: new Date().toISOString(),
        message: 'Autorizado o uso da NF-e',
        response: '<retEnviNFe><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></retEnviNFe>',
        xml_protocolo: `<?xml version="1.0" encoding="UTF-8"?><protNFe><infProt><tpAmb>2</tpAmb><verAplic>SP_NFE_PL_008i2</verAplic><chNFe>${chaveAcesso}</chNFe><dhRecbto>${new Date().toISOString()}</dhRecbto><nProt>135${Date.now().toString().slice(-10)}</nProt><digVal>...</digVal><cStat>100</cStat><xMotivo>Autorizado o uso da NF-e</xMotivo></infProt></protNFe>`
      };
    }
    
    // Atualizar log com resultado
    const statusCode = resultado.success ? 200 : (resultado.codigo === '539' ? 400 : 500);
    const updateLogStmt = db.prepare(`
      UPDATE logs_sefaz 
      SET status_code = ?, mensagem = ?, data_operacao = datetime('now')
      WHERE nf_id = ? AND operacao = 'envio' AND status_code = 0
    `);
    updateLogStmt.run(statusCode, resultado.message, nfId);
    
    console.log(`✅ Resposta SEFAZ:`, resultado.status, '-', resultado.message);
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro ao enviar para SEFAZ:', error.message);
    
    // Registrar erro no log
    const errorLogStmt = db.prepare(`
      INSERT INTO logs_sefaz (nf_id, operacao, status_code, mensagem, data_operacao)
      VALUES (?, 'envio', 500, ?, datetime('now'))
    `);
    errorLogStmt.run(nfId, `Erro de comunicação: ${error.message}`);
    
    return {
      success: false,
      status: 'erro',
      codigo: '999',
      protocolo: null,
      data_autorizacao: null,
      message: `Erro de comunicação: ${error.message}`,
      response: `<retEnviNFe><cStat>999</cStat><xMotivo>Erro de comunicação: ${error.message}</xMotivo></retEnviNFe>`
    };
  }
}

// Função para cancelar NF-e na SEFAZ (estrutura preparada para integração real)
async function cancelarNFeSEFAZ(chaveAcesso, motivo, uf = 'SP') {
  try {
    console.log(`🔄 Cancelando NF-e na SEFAZ-${uf}:`, chaveAcesso);
    
    // Validações básicas
    if (!chaveAcesso || chaveAcesso.length !== 44) {
      throw new Error('Chave de acesso inválida');
    }
    
    if (!motivo || motivo.length < 15) {
      throw new Error('Motivo do cancelamento deve ter pelo menos 15 caracteres');
    }
    
    // Obter nf_id pela chave de acesso
    const nfStmt = db.prepare('SELECT id FROM notas_fiscais WHERE chave_acesso = ?');
    const nfResult = nfStmt.get(chaveAcesso);
    
    if (!nfResult) {
      throw new Error('Nota fiscal não encontrada');
    }
    
    const nfId = nfResult.id;
    
    // Registrar tentativa de cancelamento no log
    const logStmt = db.prepare(`
      INSERT INTO logs_sefaz (nf_id, operacao, status_code, mensagem, data_operacao)
      VALUES (?, 'cancelamento', 0, ?, datetime('now'))
    `);
    logStmt.run(nfId, `Cancelando: ${motivo}`);
    
    // Simulação de cancelamento na SEFAZ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular diferentes cenários baseados na chave
    const ultimoDigito = parseInt(chaveAcesso.slice(-1));
    let resultado;
    
    if (ultimoDigito === 9) {
      // Simular erro de cancelamento
      resultado = {
        success: false,
        status: 'erro',
        codigo: '573',
        protocolo: null,
        message: 'Rejeição: NF-e fora do prazo de cancelamento (24 horas)',
        response: '<retCancNFe><cStat>573</cStat><xMotivo>NF-e fora do prazo de cancelamento</xMotivo></retCancNFe>'
      };
    } else {
      // Simular cancelamento com sucesso
      resultado = {
        success: true,
        status: 'cancelada',
        codigo: '135',
        protocolo: `135${Date.now().toString().slice(-10)}`,
        message: 'Cancelamento de NF-e homologado',
        response: '<retCancNFe><cStat>135</cStat><xMotivo>Cancelamento de NF-e homologado</xMotivo></retCancNFe>'
      };
    }
    
    // Atualizar log com resultado
    const statusCode = resultado.success ? 200 : (resultado.codigo === '573' ? 400 : 500);
    const updateLogStmt = db.prepare(`
      UPDATE logs_sefaz 
      SET status_code = ?, mensagem = ?, data_operacao = datetime('now')
      WHERE nf_id = ? AND operacao = 'cancelamento' AND status_code = 0
    `);
    updateLogStmt.run(statusCode, resultado.message, nfId);
    
    console.log(`✅ Resposta SEFAZ Cancelamento:`, resultado.status, '-', resultado.message);
    return resultado;
    
  } catch (error) {
    console.error('❌ Erro ao cancelar na SEFAZ:', error.message);
    
    // Registrar erro no log
    const errorLogStmt = db.prepare(`
      INSERT INTO logs_sefaz (nf_id, operacao, status_code, mensagem, data_operacao)
      VALUES (?, 'cancelamento', 500, ?, datetime('now'))
    `);
    errorLogStmt.run(nfId, `Erro de comunicação: ${error.message}`);
    
    return {
      success: false,
      status: 'erro',
      codigo: '999',
      protocolo: null,
      message: `Erro de comunicação: ${error.message}`,
      response: `<retCancNFe><cStat>999</cStat><xMotivo>Erro de comunicação: ${error.message}</xMotivo></retCancNFe>`
    };
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 5000;

// Endpoint de saúde para monitoramento
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});