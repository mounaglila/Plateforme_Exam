const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logAudit } = require("../utils/audit");

// Générer un token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Récupérer tous les utilisateurs
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Enregistrer un nouvel utilisateur (admin ne peut pas s'inscrire ici)
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (!["student", "professor"].includes(role)) {
  return res.status(400).json({ message: "Seuls les roles etudiant et professeur sont autorises" });
}
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Cet utilisateur existe deja' });

        const enrollmentStatus = role === "student" ? "pending" : "active";

        const user = await User.create({ name, email, password, role, enrollmentStatus });

        const payload = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            enrollmentStatus: user.enrollmentStatus,
        };
        if (enrollmentStatus !== "pending") {
            payload.token = generateToken(user._id);
        }
        await logAudit({
            actor: null,
            actorEmail: user.email,
            action: "auth.register",
            entityType: "user",
            entityId: user._id,
            meta: { role: user.role, enrollmentStatus },
            req,
        });
        res.status(201).json(payload);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Authentifier un utilisateur (login)
const authUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            const enrollmentStatus = user.enrollmentStatus || "active";
            if (user.role === "student" && enrollmentStatus === "pending") {
                return res.status(403).json({
                    message: "Votre compte est en attente de validation par un administrateur. Vous ne pouvez pas encore vous connecter.",
                });
            }
            if (enrollmentStatus === "suspended") {
                return res.status(403).json({ message: "Votre compte a ete suspendu." });
            }
            await logAudit({
                actor: user,
                action: "auth.login",
                entityType: "user",
                entityId: user._id,
                meta: {},
                req,
            });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                enrollmentStatus,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email ou mot de passe invalide.' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAnnouncementsForUser = async (req, res) => {
    try {
        const Announcement = require("../models/Announcement");
        const role = req.user.role;
        const aud =
            role === "student"
                ? ["all", "students"]
                : role === "professor"
                  ? ["all", "professors"]
                  : ["all", "students", "professors"];

        const list = await Announcement.find({ audience: { $in: aud } })
            .sort({ createdAt: -1 })
            .limit(50)
            .select("title body audience createdAt");

        res.json(list);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getUsers, registerUser, authUser, getAnnouncementsForUser };