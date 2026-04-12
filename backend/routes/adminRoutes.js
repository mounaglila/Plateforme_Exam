const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const admin = require("../controllers/adminController");

router.use(protect, adminOnly);

router.get("/dashboard-stats", admin.dashboardStats);
router.get("/reports/summary", admin.reportsSummary);

router.get("/users", admin.listUsers);
router.post("/users", admin.createUser);
router.put("/users/:id", admin.updateUser);
router.delete("/users/:id", admin.deleteUser);

router.get("/exams", admin.listExams);
router.patch("/exams/:id/approve", admin.approveExam);
router.patch("/exams/:id/reject", admin.rejectExam);
router.delete("/exams/:id", admin.deleteExam);

router.get("/audit-logs", admin.listAuditLogs);

router.get("/announcements", protect, admin.listAnnouncementsAdmin);
router.post("/announcements", admin.createAnnouncement);
router.delete("/announcements/:id", admin.deleteAnnouncement);

module.exports = router;
