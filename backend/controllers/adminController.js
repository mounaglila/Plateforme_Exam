const User = require("../models/User");
const Exam = require("../models/Exam");
const Submission = require("../models/Submission");
const Announcement = require("../models/Announcement");
const AuditLog = require("../models/AuditLog");
const { logAudit } = require("../utils/audit");

exports.dashboardStats = async (req, res) => {
  try {
    const [
      userCounts,
      examTotal,
      examPublished,
      subCount,
      pendingStudents,
      pendingExams,
      recentSubs,
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", n: { $sum: 1 } } }]),
      Exam.countDocuments(),
      Exam.countDocuments({ published: true }),
      Submission.countDocuments(),
      User.countDocuments({ role: "student", enrollmentStatus: "pending" }),
      Exam.countDocuments({ published: true, adminApproved: false }),
      Submission.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("student", "name email")
        .populate("exam", "title"),
    ]);

    const byRole = {};
    userCounts.forEach((x) => {
      byRole[x._id] = x.n;
    });

    res.json({
      users: {
        total: Object.values(byRole).reduce((a, b) => a + b, 0),
        byRole,
        pendingStudentEnrollments: pendingStudents,
      },
      exams: {
        total: examTotal,
        published: examPublished,
        pendingAdminApproval: pendingExams,
      },
      submissions: { total: subCount },
      recentSubmissions: recentSubs,
    });
  } catch (err) {
    console.error("admin.dashboardStats:", err);
    res.status(500).json({ message: err.message || "Dashboard stats failed" });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { role, enrollmentStatus } = req.query;
    const q = {};
    if (role) q.role = role;
    if (enrollmentStatus) q.enrollmentStatus = enrollmentStatus;
    const users = await User.find(q).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentStatus } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (!role || !["student", "professor", "admin"].includes(role)) {
      return res.status(400).json({ message: "role must be student, professor, or admin" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const enroll =
      enrollmentStatus && ["pending", "active", "suspended"].includes(enrollmentStatus)
        ? enrollmentStatus
        : role === "student"
          ? "active"
          : "active";

    const user = await User.create({
      name: name || "",
      email,
      password,
      role,
      enrollmentStatus: enroll,
    });

    await logAudit({
      actor: req.user,
      action: "user.create",
      entityType: "user",
      entityId: user._id,
      meta: { email, role, enrollmentStatus: enroll },
      req,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrollmentStatus: user.enrollmentStatus,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This email is already registered" });
    }
    console.error("admin.createUser:", err);
    res.status(500).json({ message: err.message || "Could not create user" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password, role, enrollmentStatus } = req.body;

    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }
    if (name !== undefined) user.name = name;
    if (password && String(password).trim()) user.password = password;

    if (role !== undefined) {
      if (!["student", "professor", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (String(user._id) === String(req.user._id) && user.role === "admin" && role !== "admin") {
        const admins = await User.countDocuments({ role: "admin" });
        if (admins <= 1) return res.status(400).json({ message: "Cannot change role of the only admin" });
      }
      user.role = role;
    }

    if (enrollmentStatus !== undefined) {
      if (!["pending", "active", "suspended"].includes(enrollmentStatus)) {
        return res.status(400).json({ message: "Invalid enrollment status" });
      }
      user.enrollmentStatus = enrollmentStatus;
    }

    await user.save();

    await logAudit({
      actor: req.user,
      action: "user.update",
      entityType: "user",
      entityId: user._id,
      meta: { email: user.email, role: user.role, enrollmentStatus: user.enrollmentStatus },
      req,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      enrollmentStatus: user.enrollmentStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      const admins = await User.countDocuments({ role: "admin" });
      if (admins <= 1) return res.status(400).json({ message: "Cannot delete the last admin" });
    }

    if (user.role === "student") {
      await Submission.deleteMany({ student: user._id });
    } else if (user.role === "professor") {
      const exams = await Exam.find({ createdBy: user._id });
      for (const ex of exams) {
        await Submission.deleteMany({ exam: ex._id });
      }
      await Exam.deleteMany({ createdBy: user._id });
    }

    await User.findByIdAndDelete(user._id);

    await logAudit({
      actor: req.user,
      action: "user.delete",
      entityType: "user",
      entityId: user._id,
      meta: { email: user.email, role: user.role },
      req,
    });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    exam.adminApproved = true;
    await exam.save();

    await logAudit({
      actor: req.user,
      action: "exam.approve",
      entityType: "exam",
      entityId: exam._id,
      meta: { title: exam.title },
      req,
    });

    res.json({ message: "Exam approved for students", exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    exam.published = false;
    exam.adminApproved = false;
    await exam.save();

    await logAudit({
      actor: req.user,
      action: "exam.reject",
      entityType: "exam",
      entityId: exam._id,
      meta: { title: exam.title },
      req,
    });

    res.json({ message: "Exam unpublished / rejected", exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    await Submission.deleteMany({ exam: exam._id });
    await Exam.findByIdAndDelete(exam._id);

    await logAudit({
      actor: req.user,
      action: "exam.delete",
      entityType: "exam",
      entityId: exam._id,
      meta: { title: exam.title },
      req,
    });

    res.json({ message: "Exam and its submissions deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reportsSummary = async (req, res) => {
  try {
    const exams = await Exam.find().select("title published adminApproved createdBy createdAt");
    const subs = await Submission.find()
      .populate("student", "name email")
      .populate("exam", "title")
      .sort({ createdAt: -1 })
      .limit(200);

    const scoreStats = await Submission.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          avgMax: { $avg: "$maxScore" },
          count: { $sum: 1 },
        },
      },
    ]);

    const activityByDay = await Submission.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          submissions: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 14 },
    ]);

    res.json({
      examsOverview: exams,
      recentSubmissions: subs,
      aggregates: scoreStats[0] || { avgScore: 0, avgMax: 0, count: 0 },
      activityByDay,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actor", "name email role");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, audience } = req.body || {};
    if (!title) return res.status(400).json({ message: "title is required" });
    const aud = ["all", "students", "professors"].includes(audience) ? audience : "all";

    const ann = await Announcement.create({
      title,
      body: body || "",
      audience: aud,
      createdBy: req.user._id,
    });

    await logAudit({
      actor: req.user,
      action: "announcement.create",
      entityType: "announcement",
      entityId: ann._id,
      meta: { title, audience: aud },
      req,
    });

    res.status(201).json(ann);
  } catch (err) {
    console.error("admin.createAnnouncement:", err);
    res.status(500).json({ message: err.message || "Could not create announcement" });
  }
};

exports.listAnnouncementsAdmin = async (req, res) => {
  try {
    const list = await Announcement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .limit(100);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return res.status(404).json({ message: "Not found" });

    await logAudit({
      actor: req.user,
      action: "announcement.delete",
      entityType: "announcement",
      entityId: req.params.id,
      meta: { title: ann.title },
      req,
    });

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
