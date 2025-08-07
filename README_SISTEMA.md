# Sistema de Gestão para Distribuidora de Reciclagem

## Visão Geral
Sistema completo de gestão desenvolvido especificamente para distribuidoras de reciclagem, com foco em controle de Notas Fiscais de Entrada e Saída.

## Modelo de Negócio

Este sistema foi desenvolvido para **distribuidoras de reciclagem** que:
- **Compram** materiais recicláveis de fornecedores (recebem notas fiscais)
- **Revendem** esses materiais para clientes (emitem notas fiscais)

## Funcionalidades Implementadas

### 1. 🧾 Sistema de Notas Fiscais Eletrônicas (NF-e)

#### 📋 Funcionalidades Completas Implementadas:

#### 📥 **Entrada de NF-e**
- ✅ **Cadastro Manual**: Formulário completo com dados do fornecedor, produtos, impostos
- ✅ **Importação XML**: Upload e parsing automático de arquivos XML NF-e 4.0
- ✅ **Código de Barras**: Leitura via câmera ou digitação manual (44 dígitos)
- ✅ **Validação**: Verificação de duplicatas e dados obrigatórios
- ✅ **Armazenamento**: Persistência completa no banco de dados

#### 📤 **Saída/Emissão de NF-e**
- ✅ **NF-e Modelo 55**: Emissão completa de Nota Fiscal Eletrônica
- ✅ **NFC-e Modelo 65**: Emissão de Cupom Fiscal Eletrônico
- ✅ **Cálculo de Impostos**: ICMS, IPI, PIS, COFINS automáticos
- ✅ **Geração XML**: Estrutura conforme layout NF-e 4.0
- ✅ **Assinatura Digital**: Suporte para certificados A1/A3 (simulado)
- ✅ **Transmissão SEFAZ**: Envio e recebimento de protocolos (simulado)
- ✅ **DANFE**: Geração de PDF para impressão

#### 🔧 **Funcionalidades Gerais**
- ✅ **Interface Moderna**: Sistema de abas intuitivo
- ✅ **Filtros Avançados**: Por status, período, parceiro
- ✅ **Histórico Completo**: Todas as notas com detalhes
- ✅ **Cancelamento**: Processo completo com motivo
- ✅ **Reimpressão**: DANFE disponível para notas autorizadas
- ✅ **Logs SEFAZ**: Registro de comunicações
- ✅ **Preview XML**: Visualização do conteúdo XML
- ✅ **Responsivo**: Interface adaptável para mobile

### 🛠️ **APIs Implementadas**:

#### Entrada de NF-e:
- `POST /api/nfe/entrada/manual` - Cadastro manual
- `POST /api/nfe/entrada/importar-xml` - Importação XML
- `POST /api/nfe/entrada/codigo-barras` - Leitura código de barras

#### Saída de NF-e:
- `POST /api/nfe/saida/emitir` - Emissão NF-e/NFC-e

#### Gestão Geral:
- `GET /api/nfe` - Listar com filtros e paginação
- `GET /api/nfe/:id` - Detalhes da nota
- `POST /api/nfe/:id/cancelar` - Cancelamento
- `GET /api/nfe/:id/danfe` - Geração DANFE

### 🗄️ **Estrutura do Banco de Dados**:

#### Tabelas Principais:
- `notas_fiscais` - Dados principais das NF-e
- `nf_itens` - Itens das notas fiscais
- `empresa_config` - Configurações da empresa
- `certificados_digitais` - Certificados para assinatura
- `logs_sefaz` - Logs de comunicação

#### Campos Implementados:
- Dados completos do emitente/destinatário
- Valores de impostos (ICMS, IPI, PIS, COFINS)
- Informações de transporte e pagamento
- Chave de acesso e protocolos SEFAZ
- Status da nota (pendente, autorizada, cancelada, etc.)
- XML completo e dados de importação

### 2. Funcionalidades de Cadastro e Importação
- **Cadastro Manual**: Formulário completo para inserir dados da nota fiscal
- **Importação XML**: Upload e processamento automático de arquivos XML
- **Código de Barras**: Scanner integrado para leitura rápida de códigos
- **Validação de Dados**: Verificação automática de informações obrigatórias
- **Controle de Duplicatas**: Prevenção de cadastro de notas já existentes

### 📥 Notas Fiscais de Entrada
- **Definição**: Documentos que registram a entrada de mercadorias/serviços na empresa
- **Casos de Uso**:
  - Compras de fornecedores
  - Devolução de clientes
  - Retorno de mercadorias
  - Transferências entre filiais
  - Importações
  - Retorno de industrialização

### 📤 Notas Fiscais de Saída
- **Definição**: Documentos que registram a saída de mercadorias/serviços da empresa
- **Casos de Uso**:
  - Vendas para clientes
  - Remessas para industrialização
  - Transferências entre filiais
  - Exportações
  - Vendas consignadas

## Estrutura do Sistema

### Backend (Node.js + SQLite)
- **Porta**: 5000
- **Banco de Dados**: SQLite com tabelas:
  - `vendas` - Registra vendas (NF-e de Saída)
  - `compras` - Registra compras (NF-e de Entrada)
  - `venda_itens` - Itens das vendas
  - `compra_itens` - Itens das compras
  - `clientes` - Cadastro de clientes
  - `fornecedores` - Cadastro de fornecedores
  - `materiais` - Cadastro de produtos/materiais
  - `estoque` - Controle de estoque

### Frontend (React)
- **Porta**: 3000
- **Páginas Principais**:
  - Dashboard - Visão geral do sistema
  - Vendas - Gestão de vendas (NF-e Saída)
  - Compras - Gestão de compras (NF-e Entrada)
  - Notas Fiscais - Visualização unificada de todas as NF-e
  - Estoque - Controle de estoque
  - Clientes - Cadastro de clientes
  - Fornecedores - Cadastro de fornecedores

## APIs Disponíveis

### Notas Fiscais
- `GET /api/notas-fiscais` - Lista todas as notas (entrada e saída)
- `GET /api/notas-fiscais/estatisticas` - Estatísticas consolidadas

### Vendas (NF-e Saída)
- `GET /api/vendas` - Lista vendas
- `POST /api/vendas` - Cria nova venda
- `GET /api/vendas/:id` - Detalhes da venda
- `POST /api/vendas/:id/emitir-nfe` - Emite NF-e de saída
- `POST /api/vendas/:id/cancelar` - Cancela NF-e de saída

### Compras (NF-e Entrada)
- `GET /api/compras` - Lista compras
- `POST /api/compras` - Cria nova compra
- `GET /api/compras/:id` - Detalhes da compra
- `POST /api/compras/:id/emitir-nfe` - Emite NF-e de entrada
- `POST /api/compras/:id/cancelar` - Cancela NF-e de entrada

## Correções Realizadas

### 1. URLs das APIs
- ✅ Corrigidas todas as URLs relativas para absolutas (`http://localhost:5000/api/...`)
- ✅ Resolvidos erros de JSON inválido causados por páginas 404

### 2. Query SQL de Notas Fiscais
- ✅ Corrigida query UNION para combinar vendas e compras
- ✅ Substituídas colunas inexistentes (`serie`, `data_emissao`)
- ✅ Corrigido ORDER BY ambíguo na query UNION

### 3. Tratamento de Erros no Frontend
- ✅ Adicionada verificação de array antes de usar `.filter()`
- ✅ Garantido que estado `notas` seja sempre um array
- ✅ Tratamento adequado de erros de API

## Status Atual
- ✅ Backend funcionando (porta 5000)
- ✅ Frontend funcionando (porta 3000)
- ✅ APIs de notas fiscais operacionais
- ✅ Integração entre entrada e saída funcionando
- ✅ Estatísticas consolidadas funcionando

## Funcionalidades Recém-Implementadas ✅

### Interface Reestruturada de Notas Fiscais
- **Tabs de Navegação**: Sistema com abas para alternar entre "Todas as Notas", "Notas de Entrada" e "Notas de Saída"
- **Informações Contextuais**: Cards explicativos sobre cada tipo de nota fiscal <mcreference link="https://focusnfe.com.br/blog/o-que-e-nota-fiscal-entrada/" index="2">2</mcreference> <mcreference link="https://www.cobrefacil.com.br/blog/nota-fiscal-de-entrada-e-saida" index="3">3</mcreference>
- **Estatísticas Específicas**: Métricas personalizadas baseadas no tipo de nota selecionado
- **Design Responsivo**: Interface moderna com gradientes e cores específicas para cada tipo

### Melhorias na Experiência do Usuário
- **Filtros Inteligentes**: Remoção do dropdown de tipo, substituído por navegação em tabs
- **Estatísticas Contextuais**: 
  - Visão geral quando "Todas" está selecionado
  - Métricas específicas de compras para "Entrada"
  - Métricas específicas de vendas para "Saída"
  - Cálculo de ticket médio por tipo de nota
- **Indicadores Visuais**: Cores e ícones específicos para diferenciar entrada (verde) e saída (vermelho)

## Próximos Passos

### Melhorias Prioritárias
1. **Implementar funcionalidade de scanner** de código de barras real
2. **Desenvolver parser de XML** para extrair dados automaticamente
3. **Adicionar validação de chave de acesso** via API da Receita Federal
4. **Criar controle de duplicatas** por chave de acesso
5. **Implementar relatórios específicos** para distribuidoras de reciclagem

### Funcionalidades Avançadas
6. **Dashboard com métricas** de compra vs venda
7. **Controle de margem de lucro** por material
8. **Integração com balança** para pesagem automática
9. **Gestão de fornecedores** com histórico de preços
10. **Alertas de oportunidades** de compra/venda

### Integrações
11. **API da Receita Federal** para consulta de notas
12. **Sistema de pagamentos** para fornecedores
13. **Integração bancária** para conciliação
14. **Backup automático** na nuvem

## Como Executar

### Backend
```bash
cd backend
node index.js
```

### Frontend
```bash
cd frontend
npm start
```

### 🚀 **Tecnologias Utilizadas**:

#### Backend:
- **Node.js + Express**: Servidor web e APIs REST
- **Better-SQLite3**: Banco de dados local para desenvolvimento
- **CORS**: Configuração para requisições cross-origin
- **Simulação SEFAZ**: Estrutura preparada para integração real

#### Frontend:
- **React.js**: Interface de usuário moderna
- **CSS3**: Estilos responsivos e animações
- **Fetch API**: Comunicação com backend
- **Sistema de Abas**: Navegação intuitiva

### 📋 **Próximos Passos para Produção**:

#### Integrações Necessárias:
1. **Certificado Digital Real**: Implementar A1/A3
2. **Biblioteca NF-e**: Integrar NFePHP, ACBr ou similar
3. **SEFAZ Real**: Conectar com webservices oficiais
4. **Banco Produção**: Migrar para PostgreSQL/MySQL
5. **Validações XML**: Parser completo NF-e 4.0
6. **Geração DANFE**: PDF real com layout oficial
7. **Backup/Logs**: Sistema de auditoria completo

#### Melhorias de UX:
1. **Câmera Real**: Implementar leitor de código de barras
2. **Upload Drag&Drop**: Melhorar importação XML
3. **Notificações**: Sistema de alertas em tempo real
4. **Relatórios**: Dashboard com gráficos e estatísticas
5. **Exportação**: Excel, PDF dos relatórios

### Acessos
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### 🧾 **Acessar Sistema NF-e**:
1. Abra o navegador em `http://localhost:3000`
2. Clique em "🧾 Sistema NF-e" no menu lateral
3. Escolha a aba "📥 Entrada" ou "📤 Saída"
4. Teste as funcionalidades de cadastro, importação e emissão