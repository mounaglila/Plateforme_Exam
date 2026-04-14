#!/bin/bash

# Script pour démarrer l'application avec Docker

echo "🐳 EduSmart - Docker Deployment"
echo "================================"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installe Docker Desktop d'abord."
    exit 1
fi

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "⚠️  .env n'existe pas. Copie .env.example en .env"
    cp .env.example .env
    echo "✅ Fichier .env créé. Édite-le avec tes variables!"
    echo "   Ouvre .env et remplace les valeurs."
    exit 1
fi

echo "📦 Démarrage des conteneurs..."
docker compose up -d

echo ""
echo "✅ Conteneurs démarrés!"
echo ""
echo "🌐 Accède à:"
echo "   Application (Nginx + React): http://localhost"
echo "   API directe (optionnel):       http://localhost:5000"
echo "   (MongoDB: URL dans .env → MONGO_URI)"
echo ""
echo "📋 Commandes utiles:"
echo "   Voir les logs:     docker compose logs -f"
echo "   Arrêter:           docker compose down"
echo "   Redémarrer:        docker compose restart"
echo ""
