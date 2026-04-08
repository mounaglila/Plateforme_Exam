const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifie si l'utilisateur est admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Admins only' });
};

// Professeur ou admin (même accès API professeur)
const professorOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'professor' || req.user.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Professors only' });
};

const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer")) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set in .env");
            return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET missing" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = user;
        return next();
    } catch (err) {
        console.log("Token verification error:", err.message);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};


module.exports = { protect,adminOnly, professorOnly };