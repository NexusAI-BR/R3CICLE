FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretório para banco de dados
RUN mkdir -p /app/data

# Expor porta
EXPOSE 5000

# Comando para iniciar aplicação
CMD ["node", "index.js"]