# 🧾 Sistema de NF-e - Documentação Completa

## 📋 Visão Geral

Sistema completo de Notas Fiscais Eletrônicas desenvolvido para distribuidoras de reciclagem, atendendo às exigências da Receita Federal do Brasil. O sistema oferece funcionalidades completas de entrada e saída de NF-e, com interface moderna e intuitiva.

## 🚀 Funcionalidades Implementadas

### 📥 Entrada de NF-e

#### ✏️ Cadastro Manual
- Formulário completo com validações
- Dados do fornecedor (nome, CNPJ/CPF, IE, endereço)
- Informações da nota (número, série, natureza da operação)
- Itens com detalhes fiscais (NCM, CFOP, CST, ICMS)
- Cálculo automático de valores
- Múltiplas formas de pagamento

#### 📄 Importação XML
- Upload de arquivos XML NF-e 4.0
- Parsing automático de todos os campos
- Validação de estrutura XML
- Verificação de duplicatas por chave de acesso
- Preenchimento automático de formulários
- Suporte a múltiplos fornecedores

#### 📱 Código de Barras
- Leitura via câmera (simulada)
- Digitação manual de 44 dígitos
- Extração automática da chave de acesso
- Consulta simulada na SEFAZ
- Importação automática dos dados
- Validação de formato

### 📤 Saída/Emissão de NF-e

#### 🧾 NF-e Modelo 55
- Emissão completa de Nota Fiscal Eletrônica
- Preenchimento com dados da empresa
- Cálculo automático de impostos (ICMS, IPI, PIS, COFINS)
- Geração de chave de acesso única
- Numeração sequencial automática
- Múltiplos itens por nota

#### 🧾 NFC-e Modelo 65
- Emissão de Cupom Fiscal Eletrônico
- Interface simplificada para vendas rápidas
- Integração com formas de pagamento
- Geração automática de QR Code (simulado)
- Impressão térmica (preparado)

#### 🔐 Processo de Emissão
1. **Validação**: Verificação de dados obrigatórios
2. **Geração XML**: Estrutura conforme layout 4.0
3. **Assinatura Digital**: Certificado A1/A3 (simulado)
4. **Transmissão**: Envio para SEFAZ (simulado)
5. **Protocolo**: Recebimento de autorização
6. **DANFE**: Geração de PDF para impressão
7. **Armazenamento**: Persistência no banco

### 🔧 Funcionalidades Gerais

#### 🎯 Interface de Usuário
- Sistema de abas intuitivo (Entrada/Saída)
- Design responsivo para desktop e mobile
- Filtros avançados (status, período, parceiro)
- Busca por número, chave ou nome
- Paginação automática
- Loading states e feedback visual

#### 📊 Gestão e Controle
- Histórico completo de notas
- Status em tempo real (Pendente, Autorizada, Cancelada)
- Cancelamento com motivo obrigatório
- Reimpressão de DANFE
- Preview do XML completo
- Logs de comunicação SEFAZ

## 🛠️ Arquitetura Técnica

### Backend (Node.js + Express)

#### 📡 APIs Implementadas

```javascript
// Entrada de NF-e
POST /api/nfe/entrada/manual          // Cadastro manual
POST /api/nfe/entrada/importar-xml    // Importação XML
POST /api/nfe/entrada/codigo-barras   // Código de barras

// Saída de NF-e
POST /api/nfe/saida/emitir           // Emissão NF-e/NFC-e

// Gestão Geral
GET  /api/nfe                        // Listar com filtros
GET  /api/nfe/:id                    // Detalhes da nota
POST /api/nfe/:id/cancelar           // Cancelamento
GET  /api/nfe/:id/danfe              // Geração DANFE
```

#### 🗄️ Estrutura do Banco

```sql
-- Tabela principal de notas fiscais
CREATE TABLE notas_fiscais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_nf TEXT NOT NULL,
  serie INTEGER DEFAULT 1,
  modelo TEXT DEFAULT '55',
  chave_acesso TEXT UNIQUE,
  tipo TEXT CHECK(tipo IN ('entrada', 'saida')),
  status TEXT DEFAULT 'pendente',
  natureza_operacao TEXT,
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Dados do parceiro
  parceiro_nome TEXT,
  parceiro_documento TEXT,
  parceiro_ie TEXT,
  parceiro_endereco TEXT,
  
  -- Valores
  valor_produtos DECIMAL(10,2) DEFAULT 0,
  valor_frete DECIMAL(10,2) DEFAULT 0,
  valor_seguro DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_outras_despesas DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  
  -- Impostos
  valor_icms DECIMAL(10,2) DEFAULT 0,
  valor_ipi DECIMAL(10,2) DEFAULT 0,
  valor_pis DECIMAL(10,2) DEFAULT 0,
  valor_cofins DECIMAL(10,2) DEFAULT 0,
  
  -- Dados técnicos
  xml_nfe TEXT,
  protocolo_autorizacao TEXT,
  data_autorizacao DATETIME,
  motivo_cancelamento TEXT,
  tipo_importacao TEXT,
  arquivo_xml_original TEXT
);

-- Itens das notas fiscais
CREATE TABLE nf_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nota_fiscal_id INTEGER,
  nome TEXT NOT NULL,
  codigo TEXT,
  quantidade DECIMAL(10,3) DEFAULT 1,
  unidade TEXT DEFAULT 'UN',
  valor_unitario DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  ncm TEXT,
  cfop TEXT,
  cst_icms TEXT,
  aliquota_icms DECIMAL(5,2) DEFAULT 0,
  valor_icms DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id)
);

-- Configurações da empresa
CREATE TABLE empresa_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  razao_social TEXT,
  nome_fantasia TEXT,
  cnpj TEXT,
  ie TEXT,
  endereco TEXT,
  cidade TEXT,
  uf TEXT,
  cep TEXT,
  telefone TEXT,
  email TEXT,
  proximo_numero_nfe INTEGER DEFAULT 1,
  proximo_numero_nfce INTEGER DEFAULT 1
);

-- Certificados digitais
CREATE TABLE certificados_digitais (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  tipo TEXT CHECK(tipo IN ('A1', 'A3')),
  arquivo_certificado BLOB,
  senha TEXT,
  data_validade DATE,
  ativo BOOLEAN DEFAULT 0
);

-- Logs de comunicação SEFAZ
CREATE TABLE logs_sefaz (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nota_fiscal_id INTEGER,
  operacao TEXT,
  xml_envio TEXT,
  xml_retorno TEXT,
  status_retorno TEXT,
  mensagem TEXT,
  data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nota_fiscal_id) REFERENCES notas_fiscais(id)
);
```

### Frontend (React.js)

#### 🎨 Componentes Principais

```javascript
// Componente principal
const NFe = () => {
  // Estados para controle de abas
  const [activeTab, setActiveTab] = useState('entrada');
  
  // Estados para dados
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Estados para formulários
  const [formData, setFormData] = useState({...});
  
  // Funcionalidades implementadas
  const handleCadastroManual = async (e) => {...};
  const handleImportarXML = async (e) => {...};
  const handleCodigoBarras = async (e) => {...};
  const handleCancelarNFe = async (nota) => {...};
  const handleGerarDANFE = async (nota) => {...};
};
```

#### 🎯 Funcionalidades de UX

- **Sistema de Abas**: Navegação fluida entre entrada e saída
- **Modais Dinâmicos**: Diferentes formulários conforme contexto
- **Validação em Tempo Real**: Feedback imediato ao usuário
- **Loading States**: Indicadores visuais de processamento
- **Responsividade**: Adaptação automática para mobile
- **Filtros Inteligentes**: Busca e filtros em tempo real

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 14+
- NPM ou Yarn
- Navegador moderno

### Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Backend
cd backend
npm install
node index.js

# Frontend (novo terminal)
cd frontend
npm install
npm start
```

### Acesso
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Sistema NF-e: Menu lateral "🧾 Sistema NF-e"

## 📋 Próximos Passos

### 🔗 Integrações para Produção

1. **Certificado Digital Real**
   - Implementar leitura de certificados A1/A3
   - Integração com HSM para A3
   - Validação de validade e revogação

2. **Biblioteca NF-e Oficial**
   - NFePHP (PHP) via API
   - ACBr (Delphi/Lazarus) via DLL
   - Tecnospeed ou similar

3. **SEFAZ Real**
   - Webservices oficiais por UF
   - Ambiente de homologação/produção
   - Tratamento de erros específicos

4. **Banco de Dados Produção**
   - Migração para PostgreSQL/MySQL
   - Índices otimizados
   - Backup automático

5. **Validações Avançadas**
   - Parser XML completo NF-e 4.0
   - Validação de schema XSD
   - Regras de negócio específicas

### 🎨 Melhorias de Interface

1. **Leitor de Código de Barras Real**
   - Integração com câmera do dispositivo
   - Biblioteca de reconhecimento OCR
   - Suporte a múltiplos formatos

2. **Upload Avançado**
   - Drag & Drop para XML
   - Preview antes da importação
   - Processamento em lote

3. **Dashboard Analítico**
   - Gráficos de emissão por período
   - Estatísticas de impostos
   - Relatórios gerenciais

4. **Notificações**
   - Alertas de vencimento de certificado
   - Status de transmissão em tempo real
   - Lembretes de obrigações fiscais

## 🛡️ Segurança e Compliance

### 🔐 Medidas Implementadas
- Validação de entrada em todas as APIs
- Sanitização de dados XML
- Logs de auditoria completos
- Verificação de duplicatas
- Controle de acesso por usuário (preparado)

### 📋 Conformidade Fiscal
- Layout NF-e 4.0 (NT 2018.005)
- Códigos de status SEFAZ
- Regras de cancelamento
- Prazos de emissão
- Armazenamento obrigatório (XML + PDF)

## 📞 Suporte e Documentação

### 📚 Recursos Adicionais
- Manual da Receita Federal
- Documentação técnica NF-e 4.0
- Códigos de erro SEFAZ
- Tabelas auxiliares (NCM, CFOP, CST)

### 🐛 Troubleshooting
- Logs detalhados no console
- Mensagens de erro específicas
- Validações passo a passo
- Simulação completa para testes

---

**Desenvolvido para atender às necessidades específicas de distribuidoras de reciclagem, com foco na simplicidade de uso e conformidade fiscal total.**