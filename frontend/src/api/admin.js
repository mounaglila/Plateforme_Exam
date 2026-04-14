import { getApiBase, authHeaders, parseJsonOrThrow } from "./auth";

const API_BASE = getApiBase();

export async function getAdminDashboardStats() {
  const res = await fetch(`${API_BASE}/api/admin/dashboard-stats`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load dashboard");
}

export async function getAdminUsers(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/admin/users${q ? `?${q}` : ""}`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load users");
}

export async function createAdminUser(payload) {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to create user");
}

export async function updateAdminUser(id, payload) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to update user");
}

export async function deleteAdminUser(id) {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to delete user");
}

export async function getAdminExams() {
  const res = await fetch(`${API_BASE}/api/admin/exams`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load exams");
}

export async function approveAdminExam(id) {
  const res = await fetch(`${API_BASE}/api/admin/exams/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to approve exam");
}

export async function rejectAdminExam(id) {
  const res = await fetch(`${API_BASE}/api/admin/exams/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to reject exam");
}

export async function deleteAdminExam(id) {
  const res = await fetch(`${API_BASE}/api/admin/exams/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to delete exam");
}

export async function getAdminReportsSummary() {
  const res = await fetch(`${API_BASE}/api/admin/reports/summary`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load reports");
}

export async function getAdminAuditLogs(limit = 200) {
  const res = await fetch(`${API_BASE}/api/admin/audit-logs?limit=${limit}`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load audit logs");
}

export async function getAdminAnnouncements() {
  const res = await fetch(`${API_BASE}/api/admin/announcements`, { headers: authHeaders() });
  return parseJsonOrThrow(res, "Failed to load announcements");
}

export async function createAdminAnnouncement(payload) {
  const res = await fetch(`${API_BASE}/api/admin/announcements`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to create announcement");
}

export async function deleteAdminAnnouncement(id) {
  const res = await fetch(`${API_BASE}/api/admin/announcements/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to delete announcement");
}
