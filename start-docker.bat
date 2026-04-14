@echo off
REM Script pour démarrer l'application avec Docker sur Windows

echo.
echo ======================================
echo   EduSmart - Docker Deployment
echo ======================================
echo.

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé. Installe Docker Desktop d'abord.
    echo    https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Vérifier si .env existe
if not exist .env (
    echo ⚠️  .env n'existe pas. Copie .env.example en .env
    copy .env.example .env
    echo ✅ Fichier .env créé. Édite-le avec tes variables!
    pause
    exit /b 1
)

echo 📦 Démarrage des conteneurs...
docker-compose up -d

echo.
echo ✅ Conteneurs démarrés!
echo.
echo 🌐 Accède à:
echo    Frontend:   http://localhost:3000
echo    Backend API: http://localhost:5000
echo    MongoDB:    mongodb://localhost:27017
echo.
echo 📋 Commandes utiles:
echo    Voir les logs:    docker-compose logs -f
echo    Arrêter:          docker-compose down
echo    Redémarrer:       docker-compose restart
echo.
pause
