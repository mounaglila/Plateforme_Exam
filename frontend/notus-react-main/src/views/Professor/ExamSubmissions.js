import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProfessorExamSubmissions } from "../../api/professor";

export default function ExamSubmissions() {
  const { id } = useParams();
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfessorExamSubmissions(id);
        setSubs(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">Exam Submissions</h1>
      {subs.map((s) => (
        <div key={s._id} className="bg-white rounded shadow p-3 mb-2">
          <p className="font-medium">{s.student?.name || "Student"} ({s.student?.email || "-"})</p>
          <p>Score: {s.score}/{s.maxScore}</p>
          <p>Status: {s.status}</p>
        </div>
      ))}
    </div>
  );
}