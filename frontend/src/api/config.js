// Ce fichier est la SEULE source de vérité pour l'URL de l'API.
// En production avec Nginx, on utilise '' (chaîne vide)
// → les requêtes vers '/api/...' sont interceptées par Nginx
//   qui les redirige vers le backend en interne.
// En développement local (npm start), on utilise localhost:5000
// → le proxy de package.json prend le relais.

const API_BASE =
  process.env.NODE_ENV === "production"
    ? ""                              // ← Nginx gère le proxy
    : process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default API_BASE;