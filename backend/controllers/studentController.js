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

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "answers must be an array" });
  }

  // Important: ici on a besoin des correctIndex pour corriger QCM
  const exam = await Exam.findOne({ _id: req.params.examId, published: true }).select("+questions.correctIndex");
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  let score = 0;
  let maxScore = 0;

  // Auto-grade seulement les MCQ
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