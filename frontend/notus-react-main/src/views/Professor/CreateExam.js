import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createProfessorExam } from "../../api/professor";

/* ══════════════════════════════════════════════════════════
   CREATE EXAM — redesigned
══════════════════════════════════════════════════════════ */
export default function CreateExam() {
  const history = useHistory();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showCorrection, setShowCorrection] = useState(false);

  const [qPrompt, setQPrompt] = useState("");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [questions, setQuestions] = useState([]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    if (!qPrompt.trim()) return;
    setQuestions((prev) => [
      ...prev,
      {
        type: "mcq",
        prompt: qPrompt,
        options: qOptions,
        correctIndex: Number(qCorrectIndex),
        points: 1,
      },
    ]);
    setQPrompt("");
    setQOptions(["", "", "", ""]);
    setQCorrectIndex(0);
  };

  const removeQuestion = (i) => setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      await createProfessorExam({
        title,
        description,
        durationMinutes: Number(durationMinutes),
        startAt: startAt || null,
        endAt: endAt || null,
        maxAttempts: Number(maxAttempts),
        showCorrection,
        questions,
      });
      history.push("/professor/dashboard");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

       :root {
          /* Fonds clairs et doux */
          --bg:          #f8fafc; /* Gris très clair bleuté */
          --surface:     #ffffff; /* Blanc pur pour les cartes */
          --surface2:    #f1f5f9; /* Gris clair pour les inputs */
          --surface3:    #e2e8f0; /* Gris un peu plus prononcé pour les survols */
          
          /* Bordures fines */
          --border:      #e2e8f0;
          --border2:     #cbd5e1;
          
          /* Textes foncés mais pas noirs */
          --text:        #334155; 
          --muted:       #64748b;
          
          /* Accents Pastels */
          --accent:      #818cf8; /* Indigo pastel */
          --accent2:     #6366f1;
          --emerald:     #6ee7b7; /* Vert menthe */
          --amber:       #fcd34d; /* Jaune doux */
          --red:         #fda4af; /* Rose/Rouge pastel */
          
          --font-d:    'Syne', sans-serif;
          --font-b:    'DM Sans', sans-serif;
        }

        .ce-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-b);
          font-size: 14px;
        }

        /* top accent bar */
        .ce-topbar {
          height: 3px;
          background: linear-gradient(90deg, var(--accent), #a78bfa, #38bdf8);
        }

        .ce-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 40px 24px 100px;
        }

        /* back link */
        .ce-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          margin-bottom: 32px;
          transition: color .15s;
        }
        .ce-back:hover { color: var(--text); }

        /* page header */
        .ce-header { margin-bottom: 36px; }
        .ce-title {
          font-family: var(--font-d);
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -.5px;
          line-height: 1.1;
        }
        .ce-subtitle {
          color: var(--muted);
          font-size: 14px;
          font-weight: 300;
          margin-top: 6px;
        }

        /* section card */
        .ce-card {
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border-radius: 18px;
          padding: 28px;
          margin-bottom: 20px;
          transition: border-color .2s;
        }
        .ce-card:focus-within { border-color: var(--border2); }

        .ce-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .ce-card-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ce-card-label {
          font-family: var(--font-d);
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: -.2px;
        }

        /* step number */
        .ce-step {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          font-family: var(--font-d);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* form grid */
        .ce-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 560px) {
          .ce-grid-2 { grid-template-columns: 1fr; }
        }

        /* field */
        .ce-field { display: flex; flex-direction: column; gap: 6px; }
        .ce-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
        }

        .ce-input, .ce-textarea {
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 10px;
          color: var(--text);
          font-family: var(--font-b);
          font-size: 14px;
          font-weight: 400;
          padding: 11px 14px;
          width: 100%;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
          appearance: none;
          -webkit-appearance: none;
        }
        .ce-input:focus, .ce-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(99,102,241,.15);
        }
        .ce-input::placeholder, .ce-textarea::placeholder { color: var(--muted); }
        .ce-textarea { resize: vertical; min-height: 90px; line-height: 1.6; }

        /* number input with unit badge */
        .ce-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .ce-input-wrap .ce-input { padding-right: 48px; }
        .ce-input-unit {
          position: absolute;
          right: 12px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 600;
          pointer-events: none;
        }

        /* toggle */
        .ce-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface2);
          border: 1px solid var(--border2);
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color .18s;
        }
        .ce-toggle-row:hover { border-color: rgba(255,255,255,.2); }
        .ce-toggle-info { flex: 1; }
        .ce-toggle-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }
        .ce-toggle-desc {
          font-size: 12px;
          color: var(--muted);
          margin-top: 2px;
        }
        .ce-switch {
          width: 40px; height: 22px;
          border-radius: 11px;
          background: var(--surface3);
          border: 1px solid var(--border2);
          position: relative;
          transition: background .2s, border-color .2s;
          flex-shrink: 0;
        }
        .ce-switch--on {
          background: var(--accent);
          border-color: var(--accent);
        }
        .ce-switch-thumb {
          position: absolute;
          top: 2px; left: 2px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,.4);
          transition: transform .2s;
        }
        .ce-switch--on .ce-switch-thumb { transform: translateX(18px); }

        /* question builder */
        .ce-qbuilder {
          border: 1px dashed var(--border2);
          border-radius: 14px;
          padding: 20px;
          margin-top: 8px;
        }
        .ce-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }
        @media (max-width: 480px) { .ce-options-grid { grid-template-columns: 1fr; } }

        .ce-option-field {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ce-option-idx {
          width: 24px; height: 24px;
          border-radius: 6px;
          background: var(--surface3);
          border: 1px solid var(--border2);
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: background .15s, color .15s, border-color .15s;
        }
        .ce-option-idx--correct {
          background: #e0e7ff;
          border-color: var(--accent);
          color: var(--accent2);
        }
        .ce-option-idx:hover { border-color: var(--border2); background: var(--surface2); }

        /* add q button */
        .ce-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--surface3);
          border: 1px solid var(--border2);
          color: var(--text);
          font-family: var(--font-b);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: background .15s, border-color .15s, transform .12s;
          margin-top: 6px;
        }
        .ce-add-btn:hover {
          background: rgba(99,102,241,.15);
          border-color: var(--accent);
          transform: translateY(-1px);
        }

        /* question list */
        .ce-qlist { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .ce-qitem {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .ce-qitem-num {
          font-family: var(--font-d);
          font-size: 12px;
          font-weight: 700;
          color: var(--accent2);
          background: #e0e7ff;
          border: 1px solid #c7d2fe;
          border-radius: 6px;
          padding: 3px 8px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .ce-qitem-body { flex: 1; min-width: 0; }
        .ce-qitem-prompt {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 8px;
        }
        .ce-qitem-opts {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .ce-qitem-opt {
          font-size: 12px;
          padding: 3px 9px;
          border-radius: 6px;
          border: 1px solid var(--border2);
          color: var(--muted);
          background: var(--surface3);
        }
        .ce-qitem-opt--correct {
          background: #ecfdf5; /* Vert menthe très clair */
          border-color: #a7f3d0;
          color: #059669; /* Texte plus foncé pour lisibilité */
        }
        .ce-qitem-del {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color .15s, background .15s;
          flex-shrink: 0;
        }
        .ce-qitem-del:hover { color: var(--red); background: rgba(248,113,113,.1); }

        /* error */
        .ce-error {
          background: rgba(248,113,113,.08);
          border: 1px solid rgba(248,113,113,.25);
          color: #fca5a5;
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 20px;
          font-size: 13px;
          display: flex; align-items: center; gap: 10px;
        }

        /* divider */
        .ce-hr {
          height: 1px;
          background: linear-gradient(90deg, var(--border2), transparent);
          margin: 24px 0;
        }

        /* submit */
        .ce-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .ce-cancel-btn {
          background: #f1f5f9;
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--font-b);
          font-size: 13px;
          font-weight: 600;
          padding: 11px 20px;
          border-radius: 11px;
          cursor: pointer;
          text-decoration: none;
          transition: color .15s, border-color .15s;
          display: inline-flex; align-items: center;
        }
        .ce-cancel-btn:hover { color: var(--text); border-color: var(--border2); }

        .ce-submit-btn {
          background: var(--accent);
          border: none;
          color: #fff;
          font-family: var(--font-d);
          font-size: 14px;
          font-weight: 700;
          padding: 12px 28px;
          border-radius: 11px;
          cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background .18s, transform .15s, box-shadow .18s;
          box-shadow: 0 4px 20px rgba(99,102,241,.3);
          letter-spacing: .2px;
        }
        .ce-submit-btn:hover:not(:disabled) {
          background: var(--accent2);
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,.4);
        }
        .ce-submit-btn:disabled { opacity: .5; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .ce-spin { animation: spin 1s linear infinite; }

        /* correct hint */
        .ce-correct-hint {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 10px;
        }
        .ce-correct-hint strong { color: var(--accent2); }
      `}</style>

      <div className="ce-root">
        <div className="ce-topbar" />

        <div className="ce-page">
          {/* back */}
          <a href="/professor/dashboard" className="ce-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour au dashboard
          </a>

          {/* header */}
          <div className="ce-header">
            <h1 className="ce-title">Créer un examen</h1>
            <p className="ce-subtitle">Configurez votre examen et ajoutez vos questions QCM</p>
          </div>

          {error && (
            <div className="ce-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#f87171" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={submit}>

            {/* ── SECTION 1 : Informations générales ── */}
            <div className="ce-card">
              <div className="ce-card-head">
                <span className="ce-step">1</span>
                <span className="ce-card-label">Informations générales</span>
              </div>

              <div className="ce-field" style={{ marginBottom: 14 }}>
                <label className="ce-label">Titre de l'examen *</label>
                <input
                  className="ce-input"
                  placeholder="ex : Examen de mathématiques — Semestre 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="ce-field">
                <label className="ce-label">Description</label>
                <textarea
                  className="ce-textarea"
                  placeholder="Instructions, contexte ou objectifs de l'examen…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* ── SECTION 2 : Paramètres ── */}
            <div className="ce-card">
              <div className="ce-card-head">
                <span className="ce-step">2</span>
                <span className="ce-card-label">Paramètres</span>
              </div>

              <div className="ce-grid-2" style={{ marginBottom: 14 }}>
                <div className="ce-field">
                  <label className="ce-label">Durée</label>
                  <div className="ce-input-wrap">
                    <input
                      className="ce-input"
                      type="number"
                      min="1"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                    />
                    <span className="ce-input-unit">min</span>
                  </div>
                </div>
                <div className="ce-field">
                  <label className="ce-label">Tentatives max</label>
                  <input
                    className="ce-input"
                    type="number"
                    min="1"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(e.target.value)}
                  />
                </div>
              </div>

              <div className="ce-grid-2" style={{ marginBottom: 20 }}>
                <div className="ce-field">
                  <label className="ce-label">Date de début</label>
                  <input
                    className="ce-input"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                </div>
                <div className="ce-field">
                  <label className="ce-label">Date de fin</label>
                  <input
                    className="ce-input"
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                  />
                </div>
              </div>

              {/* toggle */}
              <div
                className="ce-toggle-row"
                onClick={() => setShowCorrection((v) => !v)}
              >
                <div className="ce-toggle-info">
                  <p className="ce-toggle-title">Afficher la correction</p>
                  <p className="ce-toggle-desc">Les étudiants voient les bonnes réponses après soumission</p>
                </div>
                <div className={`ce-switch ${showCorrection ? "ce-switch--on" : ""}`}>
                  <div className="ce-switch-thumb" />
                </div>
              </div>
            </div>

            {/* ── SECTION 3 : Questions ── */}
            <div className="ce-card">
              <div className="ce-card-head">
                <span className="ce-step">3</span>
                <span className="ce-card-label">Questions QCM</span>
              </div>

              <div className="ce-qbuilder">
                {/* prompt */}
                <div className="ce-field" style={{ marginBottom: 14 }}>
                  <label className="ce-label">Énoncé de la question</label>
                  <input
                    className="ce-input"
                    placeholder="ex : Quelle est la dérivée de x² ?"
                    value={qPrompt}
                    onChange={(e) => setQPrompt(e.target.value)}
                  />
                </div>

                {/* options */}
                <label className="ce-label" style={{ display: "block", marginBottom: 8 }}>Options de réponse</label>
                <p className="ce-correct-hint">
                  Cliquez sur le <strong>numéro</strong> d'une option pour la marquer comme correcte
                </p>
                <div className="ce-options-grid">
                  {qOptions.map((opt, i) => (
                    <div className="ce-option-field" key={i}>
                      <div
                        className={`ce-option-idx ${qCorrectIndex === i ? "ce-option-idx--correct" : ""}`}
                        title={`Marquer l'option ${i + 1} comme correcte`}
                        onClick={() => setQCorrectIndex(i)}
                      >
                        {i + 1}
                      </div>
                      <input
                        className="ce-input"
                        style={{ flex: 1 }}
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const copy = [...qOptions];
                          copy[i] = e.target.value;
                          setQOptions(copy);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <button type="button" className="ce-add-btn" onClick={addQuestion}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Ajouter la question
                </button>
              </div>

              {/* question list */}
              {questions.length > 0 && (
                <div className="ce-qlist">
                  {questions.map((q, i) => (
                    <div className="ce-qitem" key={i}>
                      <span className="ce-qitem-num">Q{i + 1}</span>
                      <div className="ce-qitem-body">
                        <p className="ce-qitem-prompt">{q.prompt}</p>
                        <div className="ce-qitem-opts">
                          {q.options.map((o, j) => (
                            <span
                              key={j}
                              className={`ce-qitem-opt ${j === q.correctIndex ? "ce-qitem-opt--correct" : ""}`}
                            >
                              {o || `Option ${j + 1}`}
                              {j === q.correctIndex && " ✓"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button type="button" className="ce-qitem-del" onClick={() => removeQuestion(i)} title="Supprimer">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="ce-footer">
              <a href="/professor/dashboard" className="ce-cancel-btn">Annuler</a>
              <button type="submit" className="ce-submit-btn" disabled={saving}>
                {saving ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="ce-spin">
                      <circle cx="7.5" cy="7.5" r="6" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
                      <path d="M7.5 1.5a6 6 0 016 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2.5 8l3.5 3.5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Enregistrer l'examen
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
