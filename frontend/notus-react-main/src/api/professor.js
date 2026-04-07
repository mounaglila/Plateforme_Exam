import { getApiBase, authHeaders, parseJsonOrThrow } from "./auth";

const API_BASE = getApiBase();

export async function createProfessorExam(payload) {
  const res = await fetch(`${API_BASE}/api/professor/exams`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to create exam");
}

export async function getMyProfessorExams() {
  const res = await fetch(`${API_BASE}/api/professor/exams`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch professor exams");
}

export async function getProfessorExamById(examId) {
  const res = await fetch(`${API_BASE}/api/professor/exams/${examId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch exam details");
}

export async function updateProfessorExam(examId, payload) {
  const res = await fetch(`${API_BASE}/api/professor/exams/${examId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res, "Failed to update exam");
}

export async function publishProfessorExam(examId) {
  const res = await fetch(`${API_BASE}/api/professor/exams/${examId}/publish`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to publish exam");
}

export async function getProfessorExamSubmissions(examId) {
  const res = await fetch(`${API_BASE}/api/professor/exams/${examId}/submissions`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonOrThrow(res, "Failed to fetch exam submissions");
}