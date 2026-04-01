const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher } = require('../controllers/teacherController');

router.post('/register', registerTeacher);  // /api/teachers/register
router.post('/login', loginTeacher);        // /api/teachers/login

module.exports = router;