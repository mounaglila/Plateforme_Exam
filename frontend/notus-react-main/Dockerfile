# ====== BUILD STAGE ======
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build React
RUN npm run build

# ====== RUNTIME STAGE ======
FROM node:18-alpine

WORKDIR /app

# Installer serve pour servir l'app
RUN npm install -g serve

# Copier le build depuis le builder
COPY --from=builder /app/build ./build

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Servir l'app avec serve
CMD ["serve", "-s", "build", "-l", "3000"]
