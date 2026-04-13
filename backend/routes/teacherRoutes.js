const express = require("express");
const router = express.Router();

const { protect, professorOnly } = require("../middleware/authMiddleware");
const professor = require("../controllers/ProfController");
const upload = require("../middleware/upload");

// 🔐 protect all routes
router.use(protect, professorOnly);

// ================= EXAMS =================

// CREATE EXAM WITH PDF
router.post(
  "/exams",
  upload.single("pdf"),
  professor.createExam
);

router.get("/exams", professor.myExams);
router.get("/exams/:examId", professor.getMyExamById);
router.put("/exams/:examId", professor.updateExam);
router.patch("/exams/:examId/publish", professor.publishExam);
router.get("/exams/:examId/submissions", professor.examSubmissions);
<<<<<<< HEAD
router.delete("/exams/:examId", professor.deleteExam);
=======

  
>>>>>>> e14d67717872626572ca26f459dc7898e8ed7781

module.exports = router;