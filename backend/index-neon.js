const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configuração do banco de dados
let db;
let isPostgreSQL = false;

if (process.env.DATABASE_URL) {
  // PostgreSQL (Neon.tech) para produção
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  isPostgreSQL = true;
  console.log('🐘 Conectado ao PostgreSQL (Neon.tech)');
} else {
  // SQLite para desenvolvimento
  const Database = require('better-sqlite3');
  db = new Database('./database.db');
  isPostgreSQL = false;
  console.log('🗄️ Conectado ao SQLite');
}

// Função auxiliar para executar queries
async function executeQuery(query, params = []) {
  if (isPostgreSQL) {
    const client = await db.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  } else {
    if (params.length > 0) {
      return db.prepare(query).all(params);
    } else {
      return db.exec(query);
    }
  }
}

// Função auxiliar para inserir dados
async function insertQuery(query, params = []) {
  if (isPostgreSQL) {
    const client = await db.connect();
    try {
      const result = await client.query(query + ' RETURNING id', params);
      return result.rows[0]?.id;
    } finally {
      client.release();
    }
  } else {
    const stmt = db.prepare(query);
    const result = stmt.run(params);
    return result.lastInsertRowid;
  }
}

// Criação de tabelas
const createTables = async () => {
  try {
    if (isPostgreSQL) {
      // Tabelas PostgreSQL já foram criadas via Neon MCP
      console.log('✅ Tabelas PostgreSQL já configuradas');
    } else {
      // Criar tabelas SQLite para desenvolvimento
      db.exec(`CREATE TABLE IF NOT EXISTS materiais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL,
        preco_kg REAL NOT NULL,
        estoque_kg REAL DEFAULT 0,
        descricao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.exec(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT UNIQUE NOT NULL,
        email TEXT,
        telefone TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        tipo TEXT DEFAULT 'pessoa_fisica',
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.exec(`CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER REFERENCES clientes(id),
        data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
        valor_total REAL NOT NULL,
        status TEXT DEFAULT 'pendente',
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.exec(`CREATE TABLE IF NOT EXISTS itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
        material_id INTEGER REFERENCES materiais(id),
        quantidade_kg REAL NOT NULL,
        preco_unitario REAL NOT NULL,
        subtotal REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.exec(`CREATE TABLE IF NOT EXISTS notas_fiscais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER REFERENCES vendas(id),
        numero_nf TEXT UNIQUE NOT NULL,
        serie TEXT DEFAULT '1',
        chave_acesso TEXT UNIQUE,
        status TEXT DEFAULT 'pendente',
        xml_nfe TEXT,
        pdf_danfe TEXT,
        data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_autorizacao DATETIME,
        protocolo_autorizacao TEXT,
        motivo_rejeicao TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.exec(`CREATE TABLE IF NOT EXISTS logs_sefaz (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nf_id INTEGER REFERENCES notas_fiscais(id),
        operacao TEXT NOT NULL,
        status TEXT NOT NULL,
        mensagem TEXT,
        codigo_retorno TEXT,
        xml_envio TEXT,
        xml_retorno TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      console.log('✅ Tabelas SQLite criadas com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
};

// Inserir dados de exemplo (apenas para SQLite)
const insertSampleData = async () => {
  if (isPostgreSQL) {
    console.log('📊 Dados de exemplo já inseridos no Neon.tech');
    return;
  }
  
  try {
    // Verificar se já existem dados
    const existingMaterials = db.prepare('SELECT COUNT(*) as count FROM materiais').get();
    if (existingMaterials.count > 0) {
      console.log('📊 Dados de exemplo já existem');
      return;
    }
    
    // Inserir materiais
    const insertMaterial = db.prepare(`
      INSERT INTO materiais (nome, tipo, preco_kg, estoque_kg, descricao) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertMaterial.run('Papel Branco', 'Papel', 0.80, 1500.00, 'Papel branco de escritório');
    insertMaterial.run('Papelão', 'Papel', 0.45, 2000.00, 'Papelão ondulado');
    insertMaterial.run('Plástico PET', 'Plástico', 1.20, 800.00, 'Garrafas PET transparentes');
    insertMaterial.run('Alumínio', 'Metal', 4.50, 300.00, 'Latas de alumínio');
    insertMaterial.run('Ferro', 'Metal', 0.35, 5000.00, 'Sucata de ferro');
    
    // Inserir clientes
    const insertClient = db.prepare(`
      INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertClient.run('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'pessoa_fisica');
    insertClient.run('Empresa ABC Ltda', '12.345.678/0001-90', 'contato@empresaabc.com', '(11) 3333-4444', 'Av. Principal, 456', 'São Paulo', 'SP', '01234-890', 'pessoa_juridica');
    insertClient.run('Maria Santos', '987.654.321-00', 'maria@email.com', '(11) 88888-7777', 'Rua B, 789', 'Rio de Janeiro', 'RJ', '20123-456', 'pessoa_fisica');
    
    console.log('✅ Dados de exemplo inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  }
};

// Inicializar banco
createTables().then(() => {
  setTimeout(insertSampleData, 1000);
});

// Rotas da API

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: isPostgreSQL ? 'PostgreSQL (Neon.tech)' : 'SQLite',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    let stats;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const materiaisResult = await client.query('SELECT COUNT(*) as count FROM materiais');
        const clientesResult = await client.query('SELECT COUNT(*) as count FROM clientes WHERE ativo = true');
        const vendasResult = await client.query('SELECT COUNT(*) as count, COALESCE(SUM(valor_total), 0) as total FROM vendas WHERE DATE(data_venda) = CURRENT_DATE');
        const nfResult = await client.query('SELECT COUNT(*) as count FROM notas_fiscais WHERE status = $1', ['pendente']);
        
        stats = {
          totalMateriais: parseInt(materiaisResult.rows[0].count),
          clientesAtivos: parseInt(clientesResult.rows[0].count),
          vendasHoje: parseInt(vendasResult.rows[0].count),
          valorVendasHoje: parseFloat(vendasResult.rows[0].total) || 0,
          nfPendentes: parseInt(nfResult.rows[0].count)
        };
      } finally {
        client.release();
      }
    } else {
      const totalMateriais = db.prepare('SELECT COUNT(*) as count FROM materiais').get();
      const clientesAtivos = db.prepare('SELECT COUNT(*) as count FROM clientes WHERE ativo = 1').get();
      const vendasHoje = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(valor_total), 0) as total FROM vendas WHERE DATE(data_venda) = DATE("now")').get();
      const nfPendentes = db.prepare('SELECT COUNT(*) as count FROM notas_fiscais WHERE status = ?').get('pendente');
      
      stats = {
        totalMateriais: totalMateriais.count,
        clientesAtivos: clientesAtivos.count,
        vendasHoje: vendasHoje.count,
        valorVendasHoje: vendasHoje.total || 0,
        nfPendentes: nfPendentes.count
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Materiais
app.get('/api/materiais', async (req, res) => {
  try {
    let materiais;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query('SELECT * FROM materiais ORDER BY nome');
        materiais = result.rows;
      } finally {
        client.release();
      }
    } else {
      materiais = db.prepare('SELECT * FROM materiais ORDER BY nome').all();
    }
    
    res.json(materiais);
  } catch (error) {
    console.error('Erro ao buscar materiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/materiais', async (req, res) => {
  try {
    const { nome, tipo, preco_kg, estoque_kg, descricao } = req.body;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query(
          'INSERT INTO materiais (nome, tipo, preco_kg, estoque_kg, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [nome, tipo, preco_kg, estoque_kg || 0, descricao]
        );
        res.json(result.rows[0]);
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare('INSERT INTO materiais (nome, tipo, preco_kg, estoque_kg, descricao) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(nome, tipo, preco_kg, estoque_kg || 0, descricao);
      const material = db.prepare('SELECT * FROM materiais WHERE id = ?').get(result.lastInsertRowid);
      res.json(material);
    }
  } catch (error) {
    console.error('Erro ao criar material:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Clientes
app.get('/api/clientes', async (req, res) => {
  try {
    let clientes;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query('SELECT * FROM clientes ORDER BY nome');
        clientes = result.rows;
      } finally {
        client.release();
      }
    } else {
      clientes = db.prepare('SELECT * FROM clientes ORDER BY nome').all();
    }
    
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo } = req.body;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query(
          'INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo || 'pessoa_fisica']
        );
        res.json(result.rows[0]);
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare('INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const result = stmt.run(nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo || 'pessoa_fisica');
      const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
      res.json(cliente);
    }
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Vendas
app.get('/api/vendas', async (req, res) => {
  try {
    let vendas;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query(`
          SELECT v.*, c.nome as cliente_nome 
          FROM vendas v 
          LEFT JOIN clientes c ON v.cliente_id = c.id 
          ORDER BY v.data_venda DESC
        `);
        vendas = result.rows;
      } finally {
        client.release();
      }
    } else {
      vendas = db.prepare(`
        SELECT v.*, c.nome as cliente_nome 
        FROM vendas v 
        LEFT JOIN clientes c ON v.cliente_id = c.id 
        ORDER BY v.data_venda DESC
      `).all();
    }
    
    res.json(vendas);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/vendas', async (req, res) => {
  try {
    const { cliente_id, itens, observacoes } = req.body;
    const valor_total = itens.reduce((total, item) => total + (item.quantidade_kg * item.preco_unitario), 0);
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        
        // Inserir venda
        const vendaResult = await client.query(
          'INSERT INTO vendas (cliente_id, valor_total, observacoes) VALUES ($1, $2, $3) RETURNING *',
          [cliente_id, valor_total, observacoes]
        );
        const venda = vendaResult.rows[0];
        
        // Inserir itens
        for (const item of itens) {
          await client.query(
            'INSERT INTO itens_venda (venda_id, material_id, quantidade_kg, preco_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
            [venda.id, item.material_id, item.quantidade_kg, item.preco_unitario, item.quantidade_kg * item.preco_unitario]
          );
          
          // Atualizar estoque
          await client.query(
            'UPDATE materiais SET estoque_kg = estoque_kg - $1 WHERE id = $2',
            [item.quantidade_kg, item.material_id]
          );
        }
        
        await client.query('COMMIT');
        res.json(venda);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else {
      const insertVenda = db.prepare('INSERT INTO vendas (cliente_id, valor_total, observacoes) VALUES (?, ?, ?)');
      const insertItem = db.prepare('INSERT INTO itens_venda (venda_id, material_id, quantidade_kg, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?)');
      const updateEstoque = db.prepare('UPDATE materiais SET estoque_kg = estoque_kg - ? WHERE id = ?');
      
      const transaction = db.transaction(() => {
        const vendaResult = insertVenda.run(cliente_id, valor_total, observacoes);
        const vendaId = vendaResult.lastInsertRowid;
        
        for (const item of itens) {
          insertItem.run(vendaId, item.material_id, item.quantidade_kg, item.preco_unitario, item.quantidade_kg * item.preco_unitario);
          updateEstoque.run(item.quantidade_kg, item.material_id);
        }
        
        return vendaId;
      });
      
      const vendaId = transaction();
      const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(vendaId);
      res.json(venda);
    }
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Notas Fiscais
app.get('/api/notas-fiscais', async (req, res) => {
  try {
    let notas;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query(`
          SELECT nf.*, v.valor_total, c.nome as cliente_nome 
          FROM notas_fiscais nf 
          LEFT JOIN vendas v ON nf.venda_id = v.id 
          LEFT JOIN clientes c ON v.cliente_id = c.id 
          ORDER BY nf.data_emissao DESC
        `);
        notas = result.rows;
      } finally {
        client.release();
      }
    } else {
      notas = db.prepare(`
        SELECT nf.*, v.valor_total, c.nome as cliente_nome 
        FROM notas_fiscais nf 
        LEFT JOIN vendas v ON nf.venda_id = v.id 
        LEFT JOIN clientes c ON v.cliente_id = c.id 
        ORDER BY nf.data_emissao DESC
      `).all();
    }
    
    res.json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/notas-fiscais', async (req, res) => {
  try {
    const { venda_id } = req.body;
    
    // Gerar número sequencial
    let proximoNumero;
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query('SELECT COALESCE(MAX(CAST(numero_nf AS INTEGER)), 0) + 1 as proximo FROM notas_fiscais');
        proximoNumero = result.rows[0].proximo;
      } finally {
        client.release();
      }
    } else {
      const result = db.prepare('SELECT COALESCE(MAX(CAST(numero_nf AS INTEGER)), 0) + 1 as proximo FROM notas_fiscais').get();
      proximoNumero = result.proximo;
    }
    
    const numeroNF = proximoNumero.toString().padStart(9, '0');
    const chaveAcesso = gerarChaveAcesso(numeroNF, '1');
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query(
          'INSERT INTO notas_fiscais (venda_id, numero_nf, chave_acesso, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [venda_id, numeroNF, chaveAcesso, 'pendente']
        );
        res.json(result.rows[0]);
      } finally {
        client.release();
      }
    } else {
      const stmt = db.prepare('INSERT INTO notas_fiscais (venda_id, numero_nf, chave_acesso, status) VALUES (?, ?, ?, ?)');
      const result = stmt.run(venda_id, numeroNF, chaveAcesso, 'pendente');
      const nf = db.prepare('SELECT * FROM notas_fiscais WHERE id = ?').get(result.lastInsertRowid);
      res.json(nf);
    }
  } catch (error) {
    console.error('Erro ao gerar NF-e:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para gerar chave de acesso
function gerarChaveAcesso(numeroNF, serie) {
  const uf = '35'; // São Paulo
  const aamm = new Date().toISOString().slice(2, 7).replace('-', '');
  const cnpj = '12345678000190';
  const mod = '55';
  const serieFormatada = serie.padStart(3, '0');
  const numeroFormatado = numeroNF.padStart(9, '0');
  const tpEmis = '1';
  const cNF = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  const chaveSemDV = uf + aamm + cnpj + mod + serieFormatada + numeroFormatado + tpEmis + cNF;
  const dv = calcularDVChaveAcesso(chaveSemDV);
  
  return chaveSemDV + dv;
}

function calcularDVChaveAcesso(chave) {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  
  for (let i = chave.length - 1, j = 0; i >= 0; i--, j++) {
    soma += parseInt(chave[i]) * pesos[j % 8];
  }
  
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

// Logs SEFAZ
app.get('/api/logs-sefaz', async (req, res) => {
  try {
    let logs;
    
    if (isPostgreSQL) {
      const client = await db.connect();
      try {
        const result = await client.query(`
          SELECT l.*, nf.numero_nf, nf.chave_acesso 
          FROM logs_sefaz l 
          LEFT JOIN notas_fiscais nf ON l.nf_id = nf.id 
          ORDER BY l.created_at DESC 
          LIMIT 100
        `);
        logs = result.rows;
      } finally {
        client.release();
      }
    } else {
      logs = db.prepare(`
        SELECT l.*, nf.numero_nf, nf.chave_acesso 
        FROM logs_sefaz l 
        LEFT JOIN notas_fiscais nf ON l.nf_id = nf.id 
        ORDER BY l.created_at DESC 
        LIMIT 100
      `).all();
    }
    
    res.json(logs);
  } catch (error) {
    console.error('Erro ao buscar logs SEFAZ:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: '🌱 Sistema ERP de Reciclagem - API funcionando!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Banco: ${isPostgreSQL ? 'PostgreSQL (Neon.tech)' : 'SQLite'}`);
});