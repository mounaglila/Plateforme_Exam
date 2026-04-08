const AuditLog = require("../models/AuditLog");

async function logAudit({ actor, actorEmail: actorEmailOverride, action, entityType, entityId, meta, req }) {
  try {
    await AuditLog.create({
      actor: actor?._id || null,
      actorEmail: actorEmailOverride || actor?.email || "",
      action,
      entityType: entityType || "platform",
      entityId: entityId != null ? String(entityId) : null,
      meta: meta || {},
      ip: req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() || req?.ip || null,
    });
  } catch (e) {
    console.error("Audit log failed:", e.message);
  }
}

module.exports = { logAudit };
