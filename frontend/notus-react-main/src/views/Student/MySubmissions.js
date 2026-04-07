import React, { useEffect, useState } from "react";
import { getMySubmissions } from "../../api/student";

export default function MySubmissions() {
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMySubmissions();
        setSubs(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Submissions</h1>
      {subs.map((s) => (
        <div key={s._id} className="bg-white p-3 rounded shadow mb-2">
          <p className="font-semibold">{s.exam?.title || "Exam"}</p>
          <p>Attempt: {s.attemptNumber || 1}</p>
          <p>Score: {s.score}/{s.maxScore}</p>
          <p>Status: {s.status}</p>
        </div>
      ))}
    </div>
  );
}