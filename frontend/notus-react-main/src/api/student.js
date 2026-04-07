import { getApiBase, authHeaders, parseJsonOrThrow } from "./auth";

const API_BASE = getApiBase();

export async function getPublishedExams() {
  const res = await fetch(`${API_BASE}/api/student/exams`, {
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

export async function submitStudentExam(examId, payload) {
  const res = await fetch(`${API_BASE}/api/student/exams/${examId}/submissions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to submit exam");
}

export async function getMySubmissions() {
  const res = await fetch(`${API_BASE}/api/student/submissions/me`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch submissions");
}