import { getApiBase, authHeaders, parseJsonOrThrow } from "./auth";

const API_BASE = getApiBase();

export async function getPublishedExams(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/student/exams${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch published exams");
}

export async function getStudentExamById(examId) {
  const res = await fetch(`${API_BASE}/api/student/exams/${examId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch exam details");
}
export async function startStudentAttempt(examId) {
  const res = await fetch(`${API_BASE}/api/student/exams/${examId}/start`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to start attempt");
}

export async function getStudentDraft(examId) {
  const res = await fetch(`${API_BASE}/api/student/exams/${examId}/draft`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to get draft");
}

export async function saveStudentDraft(examId, payload) {
  const res = await fetch(`${API_BASE}/api/student/exams/${examId}/draft`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to save draft");
}

export async function submitStudentExam(examId, payload) {
  const res = await fetch(`${API_BASE}/api/student/exams/${examId}/submissions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to submit exam");
}

export async function getMySubmissions(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/student/submissions/me${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch submissions");
}