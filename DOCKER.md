# Scripts pour déployer avec Docker

### Démarrer l'application

#### Avec MongoDB Atlas:
```bash
# 1. Crée un fichier .env à la racine avec:
# MONGO_URI=mongodb+srv://...
# JWT_SECRET=...

# 2. Démarrer
docker-compose up -d
```

#### Avec MongoDB local:
```bash
docker-compose up -d
# MongoDB sera disponible sur localhost:27017
# App sur http://localhost:3000
# API sur http://localhost:5000
```

### Arrêter l'application
```bash
docker-compose down
```

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Juste le backend
docker-compose logs -f backend

# Juste le frontend
docker-compose logs -f frontend

# Juste MongoDB
docker-compose logs -f mongodb
```

### Redémarrer un service
```bash
docker-compose restart backend
```

### Supprimer tout (images, volumes, conteneurs)
```bash
docker-compose down -v
```

### Compiler seulement les images (sans démarrer)
```bash
docker-compose build
```

---

## 🚀 Prêt à déployer?

### Option 1: Hébergement local/sur serveur
```bash
# Sur ta machine ou un serveur avec Docker
docker-compose up -d
```

### Option 2: Docker Hub
```bash
# Build et pousse les images
docker build -t tonusername/edusmart-backend:latest ./backend
docker build -t tonusername/edusmart-frontend:latest ./frontend/notus-react-main

docker push tonusername/edusmart-backend:latest
docker push tonusername/edusmart-frontend:latest

# Alors sur le serveur, utilise le docker-compose avec tes images
```

### Option 3: Heroku/Railway/Render
Tu peux utiliser leurs services Docker natifs directement avec ce docker-compose.

---

## Troubleshooting

**Port 5000/3000 déjà utilisé?**
```bash
# Modifie dans docker-compose.yml:
# ports:
#   - "9000:5000"  <- utilise 9000 à la place
```

**MongoDB ne se connecte pas?**
```bash
# Vérifie qu'Atlas a ta IP whitelistée, OU utilise localhost:
# MONGO_URI=mongodb://examuser:exampass123@host.docker.internal:27017/edusmart
```

**React build échoue?**
```bash
# Augmente la limite de RAM:
# export NODE_OPTIONS=--max_old_space_size=4096
```
