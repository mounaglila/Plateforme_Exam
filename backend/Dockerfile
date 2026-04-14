# 1. Image de base — le système d'exploitation + runtime
FROM node:20-alpine

# 2. Répertoire de travail DANS le container
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# 4. Installer les dépendances
RUN npm install

# 5. Copier tout le reste du code
COPY . .

# 6. Exposer le port sur lequel ton backend écoute
EXPOSE 5000

# 7. Commande qui démarre l'application
CMD ["node", "server.js"]
