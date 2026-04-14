import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiBase } from "../../api/auth";
import { getSubmissionForGrading, gradeSubmission } from "../../api/professor";

export default function GradeSubmission() {
  const { id: examId, submissionId } = useParams();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [grades, setGrades] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getSubmissionForGrading(examId, submissionId);
        setExam(data.exam || null);
        setSubmission(data.submission || null);

        const seed = {};
        (data.submission?.answers || []).forEach((a) => {
          seed[String(a.questionId)] = {
            awardedPoints: a.awardedPoints || 0,
            correctionComment: a.correctionComment || "",
          };
        });
        setGrades(seed);
      } catch (e) {
        setError(e.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId, submissionId]);

  const onChange = (qId, patch) => {
    setGrades((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] || {}), ...patch },
    }));
  };

  const total = useMemo(() => {
    if (!exam?.questions) return { current: 0, max: 0 };
    let max = 0;
    let current = 0;
    for (const q of exam.questions) {
      const points = Number(q.points || 1);
      max += points;
      if (q.type === "mcq") {
        const answer = (submission?.answers || []).find((a) => String(a.questionId) === String(q._id));
        if (answer && typeof answer.selectedIndex === "number" && answer.selectedIndex === q.correctIndex) {
          current += points;
        }
      } else {
        const g = grades[String(q._id)] || {};
        const raw = Number(g.awardedPoints || 0);
        current += Math.max(0, Math.min(points, raw));
      }
    }
    return { current, max };
  }, [exam, submission, grades]);

  const submitGrade = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        grades: Object.entries(grades).map(([questionId, v]) => ({
          questionId,
          awardedPoints: Number(v.awardedPoints || 0),
          correctionComment: v.correctionComment || "",
        })),
      };

      const updated = await gradeSubmission(examId, submissionId, payload);
      setSubmission(updated);
      setSuccess("Soumission corrigée avec succès.");
    } catch (e) {
      setError(e.message || "Impossible d'enregistrer la correction");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Chargement...</div>;
  if (!exam || !submission) return <div style={{ padding: 24 }}>Soumission introuvable.</div>;

  const apiBase = getApiBase();
  const pdfUrl = exam.pdfUrl ? (String(exam.pdfUrl).startsWith("http") ? exam.pdfUrl : `${apiBase}${exam.pdfUrl}`) : null;

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Correction</h1>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>{exam.title}</p>
        </div>
        <Link to={`/professor/exams/${examId}/submissions`} style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
          Retour aux soumissions
        </Link>
      </div>

      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 10, padding: 12, marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ background: "#dcfce7", color: "#166534", borderRadius: 10, padding: 12, marginBottom: 12 }}>{success}</div>}

      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>{submission.student?.name || "Étudiant"}</p>
        <p style={{ margin: "6px 0 0", color: "#64748b" }}>{submission.student?.email || "—"}</p>
        <p style={{ margin: "8px 0 0", color: "#1e293b", fontWeight: 700 }}>Note en cours: {total.current}/{total.max}</p>
      </div>

      {exam.type === "pdf" && pdfUrl && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>Sujet PDF</p>
          <iframe
            src={pdfUrl}
            style={{
              width: "100%",
              height: "500px",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              marginTop: 10,
            }}
            title="Exam PDF"
          />
        </div>
      )}

      {(exam.questions || []).map((q, idx) => {
        const answer = (submission.answers || []).find((a) => String(a.questionId) === String(q._id));
        const points = Number(q.points || 1);
        const g = grades[String(q._id)] || { awardedPoints: 0, correctionComment: "" };
        const isMcq = q.type === "mcq" || q.type === "qcm" || (Array.isArray(q.options) && q.options.length > 0);

        return (
          <div key={q._id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 800 }}>Q{idx + 1}. {q.prompt || q.questionText || `Question ${idx + 1}`}</p>
            <p style={{ margin: "6px 0 12px", color: "#64748b", fontSize: 13 }}>Barème: {points} point(s)</p>

            {isMcq ? (
              <div>
                <p style={{ margin: "0 0 8px" }}>Réponse étudiant: <strong>{typeof answer?.selectedIndex === "number" ? `Option ${answer.selectedIndex + 1}` : "Non répondu"}</strong></p>
                <p style={{ margin: 0, color: "#16a34a", fontWeight: 700 }}>
                  {answer && typeof answer.selectedIndex === "number" && answer.selectedIndex === q.correctIndex ? "Correct (auto)" : "Incorrect (auto)"}
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Réponse étudiant</p>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, whiteSpace: "pre-wrap", marginBottom: 12 }}>
                  {answer?.textAnswer || "Aucune réponse"}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>Points accordés</label>
                    <input
                      type="number"
                      min="0"
                      max={points}
                      value={g.awardedPoints}
                      onChange={(e) => onChange(String(q._id), { awardedPoints: e.target.value })}
                      style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>Commentaire</label>
                    <input
                      value={g.correctionComment}
                      onChange={(e) => onChange(String(q._id), { correctionComment: e.target.value })}
                      placeholder="Retour pour l'étudiant"
                      style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <button
          onClick={submitGrade}
          disabled={saving}
          style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700 }}
        >
          {saving ? "Enregistrement..." : "Enregistrer la correction"}
        </button>
      </div>
    </div>
  );
}
