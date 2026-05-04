# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para compilação)
RUN npm ci

# Copiar código-fonte
COPY src ./src
COPY tsconfig.json ./
COPY prisma ./prisma

# Compilar TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para melhor gerenciamento de processos
RUN apk add --no-cache dumb-init

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código compilado do builder
COPY --from=builder /app/dist ./dist

# Copiar prisma schema e migrations
COPY prisma ./prisma

# Expor porta
EXPOSE 3000

# Usar dumb-init para iniciar a aplicação
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão
CMD ["node", "dist/index.js"]
