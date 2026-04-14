import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  getStudentExamById,
  startStudentAttempt,
  getStudentDraft,
  saveStudentDraft,
  submitStudentExam,
} from "../../api/student";
import { getApiBase } from "../../api/auth";
import StudentShell from "../../components/StudentShell";

export default function TakeExam() {
  const { id } = useParams();
  const history = useHistory();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [endsAt, setEndsAt] = useState(null);
  const [remainingSec, setRemainingSec] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const autoSubmitLockRef = useRef(false);

  const upsertAnswer = (questionId, patch) => {
    setAnswers((prev) => {
      const i = prev.findIndex((a) => String(a.questionId) === String(questionId));
      if (i === -1) return [...prev, { questionId, ...patch }];
      const copy = [...prev];
      copy[i] = { ...copy[i], ...patch, questionId };
      return copy;
    });
  };

  const getSelectedIndex = (questionId) => {
    const a = answers.find((x) => String(x.questionId) === String(questionId));
    return typeof a?.selectedIndex === "number" ? a.selectedIndex : null;
  };

  const getTextAnswer = (questionId) => {
    const a = answers.find((x) => String(x.questionId) === String(questionId));
    return a?.textAnswer || "";
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const examData = await getStudentExamById(id);
        if (!mounted) return;
        setExam(examData);

        const startData = await startStudentAttempt(id);
        if (!mounted) return;
        if (startData?.endsAt) setEndsAt(new Date(startData.endsAt).toISOString());

        const draftData = await getStudentDraft(id);
        if (!mounted) return;

        if (draftData?.draft?.answers?.length) setAnswers(draftData.draft.answers);
        if (draftData?.draft?.lastSavedAt) setLastSavedAt(draftData.draft.lastSavedAt);
        if (draftData?.draft?.endsAt) setEndsAt(new Date(draftData.draft.endsAt).toISOString());
      } catch (e) {
        setError(e.message || "Impossible de charger l'examen");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!endsAt) return;

    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
      setRemainingSec(left);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  useEffect(() => {
    if (remainingSec === null || remainingSec > 0 || autoSubmitLockRef.current) return;

    autoSubmitLockRef.current = true;
    (async () => {
      try {
        setSubmitting(true);
        await submitStudentExam(id, { answers, forceAutoSubmit: true });
        history.replace("/student/submissions");
      } catch (e) {
        setError(e.message || "Échec de soumission automatique");
      } finally {
        setSubmitting(false);
      }
    })();
  }, [remainingSec, id, answers, history]);

  useEffect(() => {
    if (!exam) return;

    const interval = setInterval(async () => {
      try {
        setSaving(true);
        const res = await saveStudentDraft(id, { answers });
        setLastSavedAt(res?.lastSavedAt || new Date().toISOString());
      } catch (e) {
        console.warn("autosave error:", e.message);
      } finally {
        setSaving(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [exam, id, answers]);

  const submitManual = async () => {
    const ok = window.confirm("Confirmer la soumission finale ? Vous ne pourrez plus modifier vos réponses.");
    if (!ok) return;

    try {
      setSubmitting(true);
      await submitStudentExam(id, { answers });
      history.replace("/student/submissions");
    } catch (e) {
      if (e.message?.includes("TIME_OVER") || e.message?.includes("Time is over")) {
        try {
          await submitStudentExam(id, { answers, forceAutoSubmit: true });
          history.replace("/student/submissions");
          return;
        } catch (e2) {
          setError(e2.message || "Échec de soumission");
        }
      } else {
        setError(e.message || "Échec de soumission");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const timerText = useMemo(() => {
    if (remainingSec === null) return "--:--";
    const m = Math.floor(remainingSec / 60);
    const s = remainingSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [remainingSec]);

  const answeredCount = useMemo(
    () => answers.filter((a) => typeof a.selectedIndex === "number" || (a.textAnswer && a.textAnswer.trim())).length,
    [answers]
  );

  if (loading) return <StudentShell title="Passage d'examen"><p>Chargement...</p></StudentShell>;
  if (error) return <StudentShell title="Passage d'examen" error={error} />;
  if (!exam) return <StudentShell title="Passage d'examen"><p>Examen introuvable.</p></StudentShell>;

  const apiBase = getApiBase();
  const pdfUrl = exam?.pdfUrl
  ? (String(exam.pdfUrl).startsWith("http") ? exam.pdfUrl : `${apiBase}${exam.pdfUrl}`)
  : null;

  const rightSlot = (
    <div
      style={{
        background: remainingSec !== null && remainingSec <= 60 ? "#fee2e2" : "#dbeafe",
        color: remainingSec !== null && remainingSec <= 60 ? "#b91c1c" : "#1e40af",
        borderRadius: 12,
        padding: "8px 12px",
        fontWeight: 800,
      }}
    >
      ⏳ {timerText}
    </div>
  );

  return (
    <StudentShell
      title={exam.title}
      subtitle={exam.description || "Répondez à toutes les questions puis soumettez."}
      error={error}
      rightSlot={rightSlot}
    >
      <p style={{ marginBottom: 14, fontSize: 13, color: "#64748b" }}>
        {saving ? "Sauvegarde..." : "Sauvegarde automatique toutes les 15s"}
        {lastSavedAt ? ` • Dernière sauvegarde: ${new Date(lastSavedAt).toLocaleTimeString("fr-FR")}` : ""}
        {` • Répondu: ${answeredCount}/${exam.questions?.length || 0}`}
      </p>

      {exam.type === "pdf" && pdfUrl && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 14, marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>Sujet PDF disponible</p>
          <a
            href={pdfUrl}
            download
            style={{ display: "inline-block", marginTop: 10, fontWeight: 700, color: "#1d4ed8" }}
          >
            📥 Télécharger le PDF
          </a>
          <p style={{ margin: "10px 0 0", color: "#1d4ed8", fontSize: 13 }}>
            ou
          </p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-block", marginTop: 6, fontWeight: 700, color: "#1d4ed8" }}
          >
            🔗 Ouvrir dans un nouvel onglet
          </a>
        </div>
      )}

      {exam.questions?.map((q, i) => (

<div
          key={q._id || q.id || i}
          style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12 }}
        >
          {(() => {
            const qId = q?._id || q?.id || null;
            return (
              <>
          <p style={{ fontWeight: 700, marginBottom: 10 }}>
            Q{i + 1}. {q.prompt || q.questionText || `Question ${i + 1}`}
          </p>

          {!qId && (
            <p style={{ marginBottom: 10, color: "#b91c1c", fontSize: 13 }}>
              Question invalide: identifiant manquant. Contactez l'enseignant pour republier cet examen.
            </p>
          )}

          {((q.type === "mcq" || q.type === "qcm") || (Array.isArray(q.options) && q.options.length > 0)) &&
            q.options?.map((op, idx) => (
              <label key={idx} style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name={String(qId || `q-${i}`)}
                  checked={qId ? getSelectedIndex(qId) === idx : false}
                  onChange={() => qId && upsertAnswer(qId, { selectedIndex: Number(idx), textAnswer: "" })}
                  disabled={!qId}
                  style={{ marginRight: 8 }}
                />
                {op}
              </label>
            ))}

          {(q.type === "text" || (!q.type && (!Array.isArray(q.options) || q.options.length === 0))) && (
            <textarea
              value={qId ? getTextAnswer(qId) : ""}
              onChange={(e) => qId && upsertAnswer(qId, { textAnswer: e.target.value })}
              placeholder="Écrivez votre réponse..."
              disabled={!qId}
              style={{
                width: "100%",
                minHeight: 110,
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                padding: 10,
                outline: "none",
              }}
            />
          )}
              </>
            );
          })()}
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
        <button
          onClick={() => history.push("/student/exams")}
          style={{ border: "1px solid #cbd5e1", background: "white", borderRadius: 10, padding: "10px 14px" }}
        >
          Quitter
        </button>
        <button
          onClick={submitManual}
          disabled={submitting}
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            fontWeight: 700,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Soumission..." : "Soumettre l'examen"}
        </button>
      </div>
    </StudentShell>
  );
}