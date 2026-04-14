const Exam = require("../models/Exam");
const Submission = require("../models/Submission");
const { logAudit } = require("../utils/audit");

// 🔐 check professor
function ensureProfessor(req, res) {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  if (req.user.role !== "professor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Professors only" });
  }

  return null;
}

// ================= CREATE EXAM =================
exports.createExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const {
    title,
    description,
    durationMinutes,
    questions,
    startAt,
    endAt,
    maxAttempts,
    showCorrection,
    published,
    type,
  } = req.body;

  if (!title)
    return res.status(400).json({ message: "title is required" });

  // PDF file (optional)
  const pdfFile = req.file ? `/uploads/${req.file.filename}` : null;
  const normalizedType = type === "pdf" ? "pdf" : "qcm";

  if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
    return res
      .status(400)
      .json({ message: "startAt must be before endAt" });
  }

  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const fallbackPdfQuestion = {
    type: "text",
    prompt: "Rédigez votre réponse à l'examen PDF.",
    points: 20,
  };

  const exam = await Exam.create({
    title,
    description: description || "",
    durationMinutes: durationMinutes || 30,
    type: normalizedType,
    questions: normalizedType === "pdf" ? (normalizedQuestions.length ? normalizedQuestions : [fallbackPdfQuestion]) : normalizedQuestions,
    createdBy: req.user._id,
    published: Boolean(published) || false,
    startAt: startAt ? new Date(startAt) : null,
    endAt: endAt ? new Date(endAt) : null,
    maxAttempts: Number(maxAttempts) > 0 ? Number(maxAttempts) : 1,
    showCorrection: Boolean(showCorrection),
    pdfUrl: pdfFile,
  });

  await logAudit({
    actor: req.user,
    action: "exam.create",
    entityType: "exam",
    entityId: exam._id,
    meta: { title: exam.title },
    req,
  });

  res.status(201).json(exam);
};

// ================= MY EXAMS =================
exports.myExams = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exams = await Exam.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });

  res.json(exams);
};

// ================= GET BY ID =================
exports.getMyExamById = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  }).select("+questions.correctIndex");

  if (!exam)
    return res.status(404).json({ message: "Exam not found" });

  res.json(exam);
};

// ================= UPDATE =================
exports.updateExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const { title, description, durationMinutes, questions } =
    req.body;

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  });

  if (!exam)
    return res.status(404).json({ message: "Exam not found" });

  if (title !== undefined) exam.title = title;
  if (description !== undefined) exam.description = description;
  if (durationMinutes !== undefined)
    exam.durationMinutes = durationMinutes;
  if (questions !== undefined && Array.isArray(questions))
    exam.questions = questions;

  await exam.save();

  res.json(exam);
};

// ================= PUBLISH =================
exports.publishExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  });

  if (!exam)
    return res.status(404).json({ message: "Exam not found" });

  exam.published = true;
  exam.adminApproved = false;

  await exam.save();

  res.json({
    message:
      "Exam published; awaiting admin approval before students can see it",
    examId: exam._id,
    published: exam.published,
  });
};

// ================= SUBMISSIONS =================
exports.examSubmissions = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  });

  if (!exam)
    return res.status(404).json({ message: "Exam not found" });

  const subs = await Submission.find({
    exam: req.params.examId,
  }).populate("student", "name email");

  res.json(subs);
};

exports.getSubmissionForGrading = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  }).select("title type pdfUrl questions");

  if (!exam)
    return res.status(404).json({ message: "Exam not found" });

  const submission = await Submission.findOne({
    _id: req.params.submissionId,
    exam: req.params.examId,
  }).populate("student", "name email");

  if (!submission)
    return res.status(404).json({ message: "Submission not found" });

  res.json({ exam, submission });
};

exports.gradeSubmission = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  const { grades = [] } = req.body || {};

  const exam = await Exam.findOne({
    _id: req.params.examId,
    createdBy: req.user._id,
  }).select("title questions");

  if (!exam)
    return res.status(404).json({ message: "Exam not found" });

  const submission = await Submission.findOne({
    _id: req.params.submissionId,
    exam: req.params.examId,
  });

  if (!submission)
    return res.status(404).json({ message: "Submission not found" });

  const gradeByQuestionId = new Map(
    (Array.isArray(grades) ? grades : []).map((g) => [String(g.questionId), g])
  );

  let score = 0;
  let maxScore = 0;

  for (const q of exam.questions || []) {
    const qId = String(q._id);
    const points = Number(q.points || 1);
    maxScore += points;

    const answer = submission.answers.find((a) => String(a.questionId) === qId);
    const gradeInput = gradeByQuestionId.get(qId) || {};

    const isMcq = q.type === "mcq" || q.type === "qcm" || (Array.isArray(q.options) && q.options.length > 0);
    if (isMcq) {
      const isCorrect = answer && typeof answer.selectedIndex === "number" && answer.selectedIndex === q.correctIndex;
      if (isCorrect) score += points;
      if (answer) {
        answer.awardedPoints = isCorrect ? points : 0;
        if (typeof gradeInput.correctionComment === "string") {
          answer.correctionComment = gradeInput.correctionComment;
        }
      }
      continue;
    }

    const rawPoints = Number(gradeInput.awardedPoints || 0);
    const bounded = Math.max(0, Math.min(points, rawPoints));
    score += bounded;

    if (answer) {
      answer.awardedPoints = bounded;
      answer.correctionComment = typeof gradeInput.correctionComment === "string" ? gradeInput.correctionComment : answer.correctionComment || "";
    }
  }

  submission.score = score;
  submission.maxScore = maxScore;
  submission.status = "graded";
  await submission.save();

  await logAudit({
    actor: req.user,
    action: "submission.grade",
    entityType: "submission",
    entityId: submission._id,
    meta: {
      examId: String(exam._id),
      score,
      maxScore,
    },
    req,
  });

  res.json(submission);
};

// ================= DELETE =================
exports.deleteExam = async (req, res) => {
  const guard = ensureProfessor(req, res);
  if (guard) return;

  await Submission.deleteMany({ exam: req.params.examId });
  await Exam.findByIdAndDelete(req.params.examId);

  res.json({ message: "Exam deleted successfully" });
};