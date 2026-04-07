const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher } = require('../controllers/teacherController');
const { protect, professorOnly } = require("../middleware/authMiddleware");
const professor = require("../controllers/ProfController");

router.use(protect, professorOnly);

router.post("/exams", professor.createExam);
router.get("/exams", professor.myExams);
router.get("/exams/:examId", professor.getMyExamById);
router.put("/exams/:examId", professor.updateExam);
router.patch("/exams/:examId/publish", professor.publishExam);
router.get("/exams/:examId/submissions", professor.examSubmissions);

router.post('/register', registerTeacher);  // /api/teachers/register
router.post('/login', loginTeacher);        // /api/teachers/login

module.exports = router;