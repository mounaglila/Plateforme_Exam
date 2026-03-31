const express = require('express');
const router = express.Router();
const { getUsers, registerUser, authUser } = require('../controllers/UserController');

// Récupérer tous les utilisateurs (GET)
router.get('/', getUsers);

// Inscription (POST)
router.post('/register', registerUser);

// Login (POST)
router.post('/login', authUser);

module.exports = router;