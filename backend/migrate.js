const { Pool } = require('pg');
require('dotenv').config();

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// SQL para criar as tabelas
const createTables = `
-- Tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  preco_kg DECIMAL(10,2) NOT NULL,
  estoque_kg DECIMAL(10,2) DEFAULT 0,
  descricao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  tipo VARCHAR(20) DEFAULT 'pessoa_fisica',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valor_total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS itens_venda (
  id SERIAL PRIMARY KEY,
  venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materiais(id),
  quantidade_kg DECIMAL(10,2) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notas fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id SERIAL PRIMARY KEY,
  venda_id INTEGER REFERENCES vendas(id),
  numero_nf VARCHAR(20) UNIQUE NOT NULL,
  serie VARCHAR(10) DEFAULT '1',
  chave_acesso VARCHAR(44) UNIQUE,
  status VARCHAR(50) DEFAULT 'pendente',
  xml_nfe TEXT,
  pdf_danfe TEXT,
  data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_autorizacao TIMESTAMP,
  protocolo_autorizacao VARCHAR(50),
  motivo_rejeicao TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs SEFAZ
CREATE TABLE IF NOT EXISTS logs_sefaz (
  id SERIAL PRIMARY KEY,
  nf_id INTEGER REFERENCES notas_fiscais(id),
  operacao VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  mensagem TEXT,
  codigo_retorno VARCHAR(10),
  xml_envio TEXT,
  xml_retorno TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_itens_venda_venda ON itens_venda(venda_id);
CREATE INDEX IF NOT EXISTS idx_itens_venda_material ON itens_venda(material_id);
CREATE INDEX IF NOT EXISTS idx_nf_venda ON notas_fiscais(venda_id);
CREATE INDEX IF NOT EXISTS idx_nf_chave ON notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_logs_nf ON logs_sefaz(nf_id);
`;

// Dados de exemplo
const insertSampleData = `
-- Inserir materiais de exemplo
INSERT INTO materiais (nome, tipo, preco_kg, estoque_kg, descricao) VALUES
('Papel Branco', 'Papel', 0.80, 1500.00, 'Papel branco de escritório'),
('Papelão', 'Papel', 0.45, 2000.00, 'Papelão ondulado'),
('Plástico PET', 'Plástico', 1.20, 800.00, 'Garrafas PET transparentes'),
('Alumínio', 'Metal', 4.50, 300.00, 'Latas de alumínio'),
('Ferro', 'Metal', 0.35, 5000.00, 'Sucata de ferro')
ON CONFLICT DO NOTHING;

-- Inserir clientes de exemplo
INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo) VALUES
('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'pessoa_fisica'),
('Empresa ABC Ltda', '12.345.678/0001-90', 'contato@empresaabc.com', '(11) 3333-4444', 'Av. Principal, 456', 'São Paulo', 'SP', '01234-890', 'pessoa_juridica'),
('Maria Santos', '987.654.321-00', 'maria@email.com', '(11) 88888-7777', 'Rua B, 789', 'Rio de Janeiro', 'RJ', '20123-456', 'pessoa_fisica')
ON CONFLICT DO NOTHING;
`;

async function migrate() {
  try {
    console.log('🔄 Iniciando migração para PostgreSQL...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida');
    
    // Criar tabelas
    console.log('📋 Criando tabelas...');
    await client.query(createTables);
    console.log('✅ Tabelas criadas com sucesso');
    
    // Inserir dados de exemplo
    console.log('📊 Inserindo dados de exemplo...');
    await client.query(insertSampleData);
    console.log('✅ Dados de exemplo inseridos');
    
    client.release();
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('- materiais');
    console.log('- clientes');
    console.log('- vendas');
    console.log('- itens_venda');
    console.log('- notas_fiscais');
    console.log('- logs_sefaz');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  migrate();
}

module.exports = { migrate, pool };