const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

function ensureStudent(req, res) {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "student") return res.status(403).json({ message: "Students only" });
  return null;
}

exports.listPublishedExams = async (req, res) => {
  const guard = ensureStudent(req, res);
  if (guard) return;

  const exams = await Exam.find({ published: true })
    .select("title description durationMinutes createdAt")
    .sort({ createdAt: -1 });

  res.json(exams);
};

exports.getExamForStudent = async (req, res) => {
  const guard = ensureStudent(req, res);
  if (guard) return;

  const exam = await Exam.findOne({ _id: req.params.examId, published: true })
    .select("title description durationMinutes questions"); // correctIndex est select:false

  if (!exam) return res.status(404).json({ message: "Exam not found" });

  res.json(exam);
};

exports.submitExam = async (req, res) => {
  const guard = ensureStudent(req, res);
  if (guard) return;

  const { answers, startedAt, timeSpentSec } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "answers must be an array" });
  }

  // On récupère les bonnes réponses pour corriger les MCQ
  const exam = await Exam.findOne({ _id: req.params.examId, published: true }).select(
    "+questions.correctIndex"
  );
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  // 1) Contrôle fenêtre de passage
  const now = new Date();
  if (exam.startAt && now < exam.startAt) {
    return res.status(400).json({ message: "Exam has not started yet" });
  }
  if (exam.endAt && now > exam.endAt) {
    return res.status(400).json({ message: "Exam is closed" });
  }

  // 2) Contrôle nombre de tentatives
  const attemptsCount = await Submission.countDocuments({
    exam: exam._id,
    student: req.user._id,
  });

  if (attemptsCount >= (exam.maxAttempts || 1)) {
    return res.status(400).json({ message: "Maximum attempts reached" });
  }

  const attemptNumber = attemptsCount + 1;

  // 3) Validation des questionId envoyés
  const validQuestionIds = new Set(exam.questions.map((q) => String(q._id)));
  for (const a of answers) {
    if (!a.questionId || !validQuestionIds.has(String(a.questionId))) {
      return res.status(400).json({ message: `Invalid questionId: ${a.questionId}` });
    }
  }

  // 4) Auto-grading MCQ
  let score = 0;
  let maxScore = 0;

  for (const q of exam.questions) {
    maxScore += q.points || 1;

    if (q.type !== "mcq") continue;

    const a = answers.find((x) => String(x.questionId) === String(q._id));
    if (!a) continue;

    if (typeof a.selectedIndex === "number" && a.selectedIndex === q.correctIndex) {
      score += q.points || 1;
    }
  }

  const submission = await Submission.create({
    exam: exam._id,
    student: req.user._id,
    answers,
    status: "submitted",
    score,
    maxScore,
    attemptNumber,
    startedAt: startedAt ? new Date(startedAt) : null,
    submittedAt: new Date(),
    timeSpentSec: Number(timeSpentSec || 0),
  });

  res.status(201).json(submission);
};

exports.mySubmissions = async (req, res) => {
  const guard = ensureStudent(req, res);
  if (guard) return;

  const subs = await Submission.find({ student: req.user._id })
    .populate("exam", "title")
    .sort({ createdAt: -1 });

  res.json(subs);
};

exports.getSubmissionById = async (req, res) => {
  const guard = ensureStudent(req, res);
  if (guard) return;

  const sub = await Submission.findOne({ _id: req.params.id, student: req.user._id })
    .populate("exam", "title description");

  if (!sub) return res.status(404).json({ message: "Submission not found" });

  res.json(sub);
};