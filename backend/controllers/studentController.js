const Exam = require("../models/Exam");
const Submission = require("../models/Submission");
const { logAudit } = require("../utils/audit");

const studentVisibleExamFilter = {
  published: true,
  $or: [{ adminApproved: true }, { adminApproved: { $exists: false } }],
};

function ensureStudent(req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Not authorized" });
    return true;
  }
  if (req.user.role !== "student") {
    res.status(403).json({ message: "Students only" });
    return true;
  }
  return false;
}

function computeAvailability(exam, now = new Date()) {
  if (exam.startAt && now < exam.startAt) return "upcoming";
  if (exam.endAt && now > exam.endAt) return "closed";
  return "open";
}

/**
 * GET /api/student/exams
 * query:
 * - q
 * - status: all | upcoming | open | closed
 * - page, limit
 * - sort: createdAt | startAt
 * - order: asc | desc
 */
exports.listPublishedExams = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const {
      q = "",
      status = "all",
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const now = new Date();

    const filter = {
      ...studentVisibleExamFilter,
      ...(q
        ? {
            $or: [
              { title: { $regex: q, $options: "i" } },
              { description: { $regex: q, $options: "i" } },
            ],
          }
        : {}),
    };

    if (status === "upcoming") {
      filter.startAt = { $gt: now };
    } else if (status === "closed") {
      filter.endAt = { $lt: now };
    } else if (status === "open") {
      filter.$and = [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
      ];
    }

    const sortField = ["createdAt", "startAt"].includes(sort) ? sort : "createdAt";
    const sortDir = order === "asc" ? 1 : -1;

    const [total, exams] = await Promise.all([
      Exam.countDocuments(filter),
      Exam.find(filter)
        .select("title description durationMinutes createdAt maxAttempts startAt endAt")
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip((p - 1) * l)
        .limit(l),
    ]);

    const data = exams.map((ex) => ({
      ...ex.toObject(),
      availabilityStatus: computeAvailability(ex, now),
    }));

    res.json({
      data,
      pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
      filters: { q, status, sort: sortField, order },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not list exams" });
  }
};

/**
 * GET /api/student/exams/:examId
 */
exports.getExamForStudent = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const exam = await Exam.findOne({
      _id: req.params.examId,
      ...studentVisibleExamFilter,
    }).select("title description durationMinutes questions startAt endAt maxAttempts");

    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not fetch exam" });
  }
};

/**
 * POST /api/student/exams/:examId/start
 */
exports.startAttempt = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const exam = await Exam.findOne({
      _id: req.params.examId,
      ...studentVisibleExamFilter,
    });

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const now = new Date();
    if (exam.startAt && now < exam.startAt) {
      return res.status(400).json({ message: "Exam has not started yet" });
    }
    if (exam.endAt && now > exam.endAt) {
      return res.status(400).json({ message: "Exam is closed" });
    }

    // Resume tentative active
    let draft = await Submission.findOne({
      exam: exam._id,
      student: req.user._id,
      status: "in_progress",
    });

    if (draft) {
      const endsAt = new Date(draft.startedAt.getTime() + (exam.durationMinutes || 30) * 60000);
      return res.json({
        message: "Attempt resumed",
        submissionId: draft._id,
        attemptNumber: draft.attemptNumber,
        startedAt: draft.startedAt,
        endsAt,
      });
    }

    const attemptsCount = await Submission.countDocuments({
      exam: exam._id,
      student: req.user._id,
      status: { $in: ["submitted", "graded"] },
    });

    if (attemptsCount >= (exam.maxAttempts || 1)) {
      return res.status(400).json({ message: "Maximum attempts reached" });
    }

    draft = await Submission.create({
      exam: exam._id,
      student: req.user._id,
      status: "in_progress",
      attemptNumber: attemptsCount + 1,
      startedAt: now,
      answers: [],
    });

    await logAudit({
      actor: req.user,
      action: "exam.start",
      entityType: "submission",
      entityId: draft._id,
      meta: { examId: String(exam._id), attemptNumber: draft.attemptNumber },
      req,
    });

    res.status(201).json({
      message: "Attempt started",
      submissionId: draft._id,
      attemptNumber: draft.attemptNumber,
      startedAt: draft.startedAt,
      endsAt: new Date(draft.startedAt.getTime() + (exam.durationMinutes || 30) * 60000),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not start attempt" });
  }
};

/**
 * GET /api/student/exams/:examId/draft
 */
exports.getDraft = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const exam = await Exam.findOne({
      _id: req.params.examId,
      ...studentVisibleExamFilter,
    }).select("durationMinutes");

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const draft = await Submission.findOne({
      exam: req.params.examId,
      student: req.user._id,
      status: "in_progress",
    });

    if (!draft) return res.json({ draft: null });

    const endsAt = new Date(draft.startedAt.getTime() + (exam.durationMinutes || 30) * 60000);

    res.json({
      draft: {
        submissionId: draft._id,
        attemptNumber: draft.attemptNumber,
        startedAt: draft.startedAt,
        lastSavedAt: draft.lastSavedAt,
        answers: draft.answers,
        endsAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not fetch draft" });
  }
};

/**
 * PATCH /api/student/exams/:examId/draft
 * body: { answers: [] }
 */
exports.saveDraft = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const { answers } = req.body || {};
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    const exam = await Exam.findOne({
      _id: req.params.examId,
      ...studentVisibleExamFilter,
    }).select("questions");

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const draft = await Submission.findOne({
      exam: exam._id,
      student: req.user._id,
      status: "in_progress",
    });

    if (!draft) {
      return res.status(404).json({ message: "No active attempt. Call /start first." });
    }

    const validQuestionIds = new Set(exam.questions.map((q) => String(q._id)));
    for (const a of answers) {
      if (!a.questionId || !validQuestionIds.has(String(a.questionId))) {
        return res.status(400).json({ message: `Invalid questionId: ${a.questionId}` });
      }
    }

    draft.answers = answers;
    draft.lastSavedAt = new Date();
    await draft.save();

    res.json({
      message: "Draft saved",
      submissionId: draft._id,
      lastSavedAt: draft.lastSavedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not save draft" });
  }
};

/**
 * POST /api/student/exams/:examId/submissions
 * body: { answers?: [], forceAutoSubmit?: boolean }
 */
exports.submitExam = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const { answers = [], forceAutoSubmit = false } = req.body || {};
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers must be an array" });
    }

    const exam = await Exam.findOne({
      _id: req.params.examId,
      ...studentVisibleExamFilter,
    }).select("+questions.correctIndex");

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const now = new Date();

    if (exam.startAt && now < exam.startAt) {
      return res.status(400).json({ message: "Exam has not started yet" });
    }
    if (exam.endAt && now > exam.endAt && !forceAutoSubmit) {
      return res.status(400).json({ message: "Exam is closed" });
    }

    const draft = await Submission.findOne({
      exam: exam._id,
      student: req.user._id,
      status: "in_progress",
    });

    if (!draft) {
      return res.status(404).json({ message: "No active attempt. Call /start first." });
    }

    const durationMs = (exam.durationMinutes || 30) * 60 * 1000;
    const attemptEndsAt = new Date(draft.startedAt.getTime() + durationMs);
    const timedOut = now > attemptEndsAt;

    if (timedOut && !forceAutoSubmit) {
      return res.status(400).json({ message: "Time is over", code: "TIME_OVER" });
    }

    const finalAnswers = answers.length ? answers : draft.answers;

    const validQuestionIds = new Set(exam.questions.map((q) => String(q._id)));
    for (const a of finalAnswers) {
      if (!a.questionId || !validQuestionIds.has(String(a.questionId))) {
        return res.status(400).json({ message: `Invalid questionId: ${a.questionId}` });
      }
    }

    let score = 0;
    let maxScore = 0;

    for (const q of exam.questions) {
      const points = q.points || 1;
      maxScore += points;

      if (q.type !== "mcq") continue;
      const a = finalAnswers.find((x) => String(x.questionId) === String(q._id));
      if (!a) continue;

      if (typeof a.selectedIndex === "number" && a.selectedIndex === q.correctIndex) {
        score += points;
      }
    }

    draft.answers = finalAnswers;
    draft.status = "submitted";
    draft.score = score;
    draft.maxScore = maxScore;
    draft.submittedAt = now;
    draft.timeSpentSec = Math.max(0, Math.floor((now.getTime() - draft.startedAt.getTime()) / 1000));
    draft.autoSubmitted = timedOut || Boolean(forceAutoSubmit);

    await draft.save();

    await logAudit({
      actor: req.user,
      action: draft.autoSubmitted ? "exam.auto_submit" : "exam.submit",
      entityType: "submission",
      entityId: draft._id,
      meta: {
        examId: String(exam._id),
        score,
        maxScore,
        attemptNumber: draft.attemptNumber,
        autoSubmitted: draft.autoSubmitted,
      },
      req,
    });

    res.status(201).json(draft);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not submit exam" });
  }
};

/**
 * GET /api/student/submissions/me
 * query: page, limit, status, examId, sort, order
 */
exports.mySubmissions = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const {
      page = 1,
      limit = 10,
      status = "all",
      examId,
      sort = "createdAt", // createdAt | submittedAt | score
      order = "desc",
    } = req.query;

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

    const filter = { student: req.user._id };
    if (status !== "all") filter.status = status;
    if (examId) filter.exam = examId;

    const sortField = ["createdAt", "submittedAt", "score"].includes(sort) ? sort : "createdAt";
    const sortDir = order === "asc" ? 1 : -1;

    const [total, subs] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.find(filter)
        .populate("exam", "title durationMinutes showCorrection")
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip((p - 1) * l)
        .limit(l),
    ]);

    res.json({
      data: subs,
      pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
      filters: { status, examId: examId || null, sort: sortField, order },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not fetch submissions" });
  }
};

exports.getSubmissionById = async (req, res) => {
  if (ensureStudent(req, res)) return;

  try {
    const sub = await Submission.findOne({
      _id: req.params.id,
      student: req.user._id,
    }).populate("exam", "title description showCorrection questions.prompt questions.type");

    if (!sub) return res.status(404).json({ message: "Submission not found" });

    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not fetch submission" });
  }
};