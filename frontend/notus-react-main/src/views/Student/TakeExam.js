import React, { useEffect, useMemo, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getStudentExamById, submitStudentExam } from "../../api/student";

export default function TakeExam() {
  const { id } = useParams();
  const history = useHistory();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [startedAt] = useState(new Date().toISOString());

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudentExamById(id);
        setExam(data);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  const startMs = useMemo(() => Date.now(), []);

  const setMcqAnswer = (questionId, selectedIndex) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      return [...filtered, { questionId, selectedIndex: Number(selectedIndex) }];
    });
  };

  const submit = async () => {
    try {
      const timeSpentSec = Math.floor((Date.now() - startMs) / 1000);
      await submitStudentExam(id, { answers, startedAt, timeSpentSec });
      history.push("/student/submissions");
    } catch (e) {
      setError(e.message);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!exam) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded shadow p-4">
      <h1 className="text-xl font-bold mb-2">{exam.title}</h1>
      <p className="mb-4">{exam.description}</p>

      {exam.questions?.map((q, i) => (
        <div key={q._id} className="mb-4">
          <p className="font-medium">Q{i + 1}. {q.prompt}</p>
          {q.type === "mcq" && q.options?.map((op, idx) => (
            <label key={idx} className="block">
              <input type="radio" name={q._id} onChange={() => setMcqAnswer(q._id, idx)} /> {op}
            </label>
          ))}
          {q.type === "text" && (
            <textarea
              className="border p-2 w-full mt-2"
              onChange={(e) => {
                const val = e.target.value;
                setAnswers((prev) => {
                  const filtered = prev.filter((a) => a.questionId !== q._id);
                  return [...filtered, { questionId: q._id, textAnswer: val }];
                });
              }}
            />
          )}
        </div>
      ))}

      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={submit}>
        Submit Exam
      </button>
    </div>
  );
}