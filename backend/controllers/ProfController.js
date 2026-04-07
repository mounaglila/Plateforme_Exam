const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

function ensureProfessor(req, res) {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "professor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Professors only" });
  }
  return null;
}

// POST /api/professor/exams
exports.createExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const { title, description, durationMinutes, questions,startAt,
    endAt,
    maxAttempts,
    showCorrection, } = req.body;
  if (!title) return res.status(400).json({ message: "title is required" });
    // validation dates
  if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
    return res.status(400).json({ message: "startAt must be before endAt" });
  }

  const exam = await Exam.create({
    title,
    description: description || "",
    durationMinutes: durationMinutes || 30,
    questions: Array.isArray(questions) ? questions : [],
    createdBy: req.user._id,
    published: false,
    startAt: startAt ? new Date(startAt) : null,
    endAt: endAt ? new Date(endAt) : null,
    maxAttempts: Number(maxAttempts) > 0 ? Number(maxAttempts) : 1,
    showCorrection: Boolean(showCorrection),
  });

  res.status(201).json(exam);
};

// GET /api/professor/exams
exports.myExams = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exams = await Exam.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
  res.json(exams);
};

// GET /api/professor/exams/:examId
exports.getMyExamById = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  }).select("+questions.correctIndex");

  if (!exam) return res.status(404).json({ message: "Exam not found" });
  res.json(exam);
};

// PUT /api/professor/exams/:examId
exports.updateExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const { title, description, durationMinutes, questions } = req.body;

  const exam = await Exam.findOne({ _id: req.params.examId, createdBy: req.user._id });
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  if (title !== undefined) exam.title = title;
  if (description !== undefined) exam.description = description;
  if (durationMinutes !== undefined) exam.durationMinutes = durationMinutes;
  if (questions !== undefined && Array.isArray(questions)) exam.questions = questions;

  await exam.save();
  res.json(exam);
};

// PATCH /api/professor/exams/:examId/publish
exports.publishExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({ _id: req.params.examId, createdBy: req.user._id });
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  exam.published = true;
  await exam.save();

  res.json({ message: "Exam published", examId: exam._id, published: exam.published });
};

// GET /api/professor/exams/:examId/submissions
exports.examSubmissions = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({ _id: req.params.examId, createdBy: req.user._id });
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  const subs = await Submission.find({ exam: exam._id })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.json(subs);
};