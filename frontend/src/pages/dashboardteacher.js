import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import { getToken } from "../api/auth";    // ← token centralisé
import API_BASE from "../api/config";      // ← URL centralisée


const Dashboard = () => {
  const [exams, setExams] = useState([]);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  // récupérer les examens
  const fetchExams = useCallback(async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/exams`, authHeader());
    setExams(res.data);
  } catch (err) {
    console.log(err);
  }
}, []);

  useEffect(() => {
  fetchExams();
}, [fetchExams]);
  // supprimer un examen
  const deleteExam = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/exams/${id}`, authHeader());
      fetchExams(); // refresh
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard Enseignant</h2>

      {exams.length === 0 ? (
        <p>Aucun examen</p>
      ) : (
        exams.map((exam) => (
          <div key={exam._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <p>Date : {new Date(exam.date).toLocaleString()}</p>
            <p>Durée : {exam.duration} min</p>

            <button onClick={() => deleteExam(exam._id)}>
              Supprimer
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;