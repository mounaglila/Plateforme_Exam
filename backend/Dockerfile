# ====== BUILD STAGE ======
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# ====== RUNTIME STAGE ======
FROM node:18-alpine

WORKDIR /app

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Copier les dépendances du builder
COPY --from=builder /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Créer un dossier uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# Démarrer l'application
CMD ["node", "server.js"]
