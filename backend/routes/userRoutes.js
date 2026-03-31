const express = require('express');
const router = express.Router();
const { getUsers, registerUser, authUser } = require('../controllers/UserController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Récupérer tous les utilisateurs (GET)
router.get('/all-users',protect , adminOnly, getUsers);

// Inscription (POST)
router.post('/register',registerUser);

// Login (POST)
router.post('/login', authUser);

module.exports = router;