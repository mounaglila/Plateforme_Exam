import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [exams, setExams] = useState([]);

  const token = localStorage.getItem("token");

  // récupérer les examens
  const fetchExams = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExams(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // supprimer un examen
  const deleteExam = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/exams/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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