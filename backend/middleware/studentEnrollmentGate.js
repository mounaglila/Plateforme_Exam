/** Blocks student API access until enrollment is active (after protect). */
function studentEnrollmentGate(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  if (req.user.role !== "student") return next();

  const status = req.user.enrollmentStatus || "active";
  if (status === "pending") {
    return res.status(403).json({
      message: "Your account is pending administrator approval before you can use the platform.",
    });
  }
  if (status === "suspended") {
    return res.status(403).json({ message: "Your account has been suspended. Contact an administrator." });
  }
  next();
}

module.exports = { studentEnrollmentGate };
