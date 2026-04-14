# ===== Étape 1 : Build React =====
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ===== Étape 2 : Servir avec Nginx =====
FROM nginx:alpine

# Supprimer la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre config personnalisée (on la crée à l'étape 2)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build React dans le dossier que Nginx va servir
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]