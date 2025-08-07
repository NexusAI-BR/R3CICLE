-- Inicialização do Banco de Dados PostgreSQL para R3CICLE ERP

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Materiais
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

-- Tabela de Clientes
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

-- Tabela de Vendas
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

-- Tabela de Itens de Venda
CREATE TABLE IF NOT EXISTS itens_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
    material_id INTEGER REFERENCES materiais(id),
    quantidade_kg DECIMAL(10,2) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notas Fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id),
    numero_nf VARCHAR(20) UNIQUE NOT NULL,
    serie VARCHAR(5) DEFAULT '1',
    chave_acesso VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'pendente',
    xml_nfe TEXT,
    pdf_danfe TEXT,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_autorizacao TIMESTAMP,
    protocolo_autorizacao VARCHAR(100),
    motivo_rejeicao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs SEFAZ
CREATE TABLE IF NOT EXISTS logs_sefaz (
    id SERIAL PRIMARY KEY,
    nf_id INTEGER REFERENCES notas_fiscais(id),
    operacao VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    mensagem TEXT,
    codigo_retorno VARCHAR(20),
    xml_envio TEXT,
    xml_retorno TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO materiais (nome, tipo, preco_kg, estoque_kg, descricao) VALUES
('Papel Branco', 'Papel', 0.80, 1500.00, 'Papel branco de escritório'),
('Papelão', 'Papel', 0.45, 2000.00, 'Papelão ondulado'),
('Plástico PET', 'Plástico', 1.20, 800.00, 'Garrafas PET transparentes'),
('Alumínio', 'Metal', 4.50, 300.00, 'Latas de alumínio'),
('Ferro', 'Metal', 0.35, 5000.00, 'Sucata de ferro')
ON CONFLICT DO NOTHING;

INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco, cidade, estado, cep, tipo) VALUES
('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'pessoa_fisica'),
('Empresa ABC Ltda', '12.345.678/0001-90', 'contato@empresaabc.com', '(11) 3333-4444', 'Av. Principal, 456', 'São Paulo', 'SP', '01234-890', 'pessoa_juridica'),
('Maria Santos', '987.654.321-00', 'maria@email.com', '(11) 88888-7777', 'Rua B, 789', 'Rio de Janeiro', 'RJ', '20123-456', 'pessoa_fisica')
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_materiais_tipo ON materiais(tipo);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON vendas(status);
CREATE INDEX IF NOT EXISTS idx_notas_status ON notas_fiscais(status);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs_sefaz(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas necessárias
CREATE TRIGGER update_materiais_updated_at BEFORE UPDATE ON materiais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notas_fiscais_updated_at BEFORE UPDATE ON notas_fiscais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();