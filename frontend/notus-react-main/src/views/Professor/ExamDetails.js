import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProfessorExamById } from "../../api/professor";

export default function ExamDetails() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfessorExamById(id);
        setExam(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!exam) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded shadow p-4">
      <h1 className="text-xl font-bold mb-2">{exam.title}</h1>
      <p>{exam.description}</p>
      <p className="text-sm mt-2">Duration: {exam.durationMinutes} min</p>
      <p className="text-sm">Published: {exam.published ? "Yes" : "No"}</p>

      <h2 className="font-semibold mt-4 mb-2">Questions</h2>
      {exam.questions?.map((q, i) => (
        <div key={q._id} className="border rounded p-2 mb-2">
          <p className="font-medium">Q{i + 1}: {q.prompt}</p>
          <p className="text-sm">Type: {q.type}</p>
        </div>
      ))}
    </div>
  );
}