import axios from "axios";
import { getToken } from "./auth";
import API_BASE from "./config";  // importe le fichier central

// Plus de "http://localhost:5000" hardcodé ici
const API = `${API_BASE}/api/professor`;
const authHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

// CREATE EXAM (JSON pour QCM, FormData pour PDF)
export const createProfessorExam = async (data, isFormData = false) => {
  const token = getToken();

  const response = await fetch(`${API}/exams`, {
    method: "POST",
    headers: isFormData
      ? { Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Erreur lors de la création de l'examen");
  }

  return response.json();
};

// GET ALL EXAMS
export const getMyProfessorExams = () =>
  axios.get(`${API}/exams`, authHeader()).then(res => res.data);

// GET ONE
export const getProfessorExamById = (id) =>
  axios.get(`${API}/exams/${id}`, authHeader()).then(res => res.data);

// UPDATE
export const updateProfessorExam = (id, data) =>
  axios.put(`${API}/exams/${id}`, data, authHeader()).then(res => res.data);

// DELETE
export const deleteProfessorExam = (id) =>
  axios.delete(`${API}/exams/${id}`, authHeader()).then(res => res.data);

// PUBLISH
export const publishProfessorExam = (id) =>
  axios.patch(`${API}/exams/${id}/publish`, {}, authHeader()).then(res => res.data);

// SUBMISSIONS
export const getExamSubmissions = (id) =>
  axios.get(`${API}/exams/${id}/submissions`, authHeader()).then(res => res.data);

export const getSubmissionForGrading = (examId, submissionId) =>
  axios.get(`${API}/exams/${examId}/submissions/${submissionId}`, authHeader()).then(res => res.data);

export const gradeSubmission = (examId, submissionId, data) =>
  axios.patch(`${API}/exams/${examId}/submissions/${submissionId}/grade`, data, authHeader()).then(res => res.data);