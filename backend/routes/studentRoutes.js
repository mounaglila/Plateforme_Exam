const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { studentEnrollmentGate } = require("../middleware/studentEnrollmentGate");
const student = require("../controllers/studentController");

router.use(protect);
router.use(studentEnrollmentGate);

router.get("/exams", student.listPublishedExams);
router.get("/exams/:examId", student.getExamForStudent);
router.post("/exams/:examId/submissions", student.submitExam);

router.get("/submissions/me", student.mySubmissions);
router.get("/submissions/:id", student.getSubmissionById);

module.exports = router;
