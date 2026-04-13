import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createProfessorExam } from "../../api/professor";

export default function CreateExam() {
  const history = useHistory();

  // ── type selection ──
  const [examType, setExamType] = useState(null); // null | "qcm" | "pdf"

  // ── shared fields ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [showCorrection, setShowCorrection] = useState(false);

  // ── QCM ──
  const [qPrompt, setQPrompt] = useState("");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [questions, setQuestions] = useState([]);

  // ── PDF ──
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    if (!qPrompt.trim()) return;
    setQuestions((prev) => [
      ...prev,
      { type: "mcq", prompt: qPrompt, options: qOptions, correctIndex: Number(qCorrectIndex), points: 1 },
    ]);
    setQPrompt("");
    setQOptions(["", "", "", ""]);
    setQCorrectIndex(0);
  };

  const removeQuestion = (i) => setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const handlePdfChange = (file) => {
    if (file && file.type === "application/pdf") setPdfFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setPdfDragOver(false);
    handlePdfChange(e.dataTransfer.files[0]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!examType) { setError("Veuillez choisir un type d'examen."); return; }
    try {
      setSaving(true);
      setError("");
      if (examType === "pdf") {
        if (!pdfFile) { setError("Veuillez sélectionner un fichier PDF."); setSaving(false); return; }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("durationMinutes", durationMinutes);
        if (startAt) formData.append("startAt", startAt);
        if (endAt) formData.append("endAt", endAt);
        formData.append("maxAttempts", maxAttempts);
        formData.append("type", "pdf");
        formData.append("published", "true");
        formData.append("pdf", pdfFile);
        await createProfessorExam(formData, true);
      } else {
        await createProfessorExam({
          title, description,
          durationMinutes: Number(durationMinutes),
          startAt: startAt || null,
          endAt: endAt || null,
          maxAttempts: Number(maxAttempts),
          showCorrection, questions,
          type: "qcm",
        });
      }
      history.push("/professor/dashboard");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:            #f8fafc;
          --surface:       #ffffff;
          --surface2:      #f1f5f9;
          --surface3:      #e2e8f0;
          --border:        #e2e8f0;
          --border2:       #cbd5e1;
          --border-focus:  #a5b4fc;
          --text:          #1e293b;
          --text-body:     #334155;
          --muted:         #64748b;
          --light:         #94a3b8;
          --primary:       #6366f1;
          --primary-light: #eef2ff;
          --primary-dim:   rgba(99,102,241,0.10);
          --success:       #10b981;
          --success-bg:    #ecfdf5;
          --success-border:#a7f3d0;
          --warning:       #f59e0b;
          --warning-bg:    #fffbeb;
          --warning-border:#fde68a;
          --danger:        #ef4444;
          --font-d: 'Syne', sans-serif;
          --font-b: 'DM Sans', sans-serif;
          --radius-sm: 10px;
          --radius-md: 14px;
          --radius-lg: 18px;
          --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
          --shadow-primary: 0 8px 20px rgba(99,102,241,0.25);
        }

        .ce-root { min-height: 100vh; background: var(--bg); color: var(--text-body); font-family: var(--font-b); font-size: 14px; -webkit-font-smoothing: antialiased; }
        .ce-topbar { height: 3px; background: linear-gradient(90deg, var(--primary) 0%, #818cf8 50%, #38bdf8 100%); }
        .ce-page { max-width: 820px; margin: 0 auto; padding: 36px 24px 100px; }

        .ce-back { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 13px; font-weight: 500; text-decoration: none; margin-bottom: 28px; transition: color .15s; }
        .ce-back:hover { color: var(--text); }

        .ce-header { margin-bottom: 32px; }
        .ce-title { font-family: var(--font-d); font-size: clamp(24px,4vw,30px); font-weight: 800; color: var(--text); letter-spacing: -.5px; line-height: 1.1; }
        .ce-subtitle { color: var(--muted); font-size: 14px; margin-top: 5px; }

        /* ═══ TYPE SELECTOR ═══ */
        .ce-type-section { margin-bottom: 28px; }
        .ce-type-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 12px; display: block; }

        .ce-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 500px) { .ce-type-grid { grid-template-columns: 1fr; } }

        .ce-type-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 22px 20px 20px;
          cursor: pointer;
          transition: all .2s ease;
          display: flex; flex-direction: column; gap: 14px;
          position: relative; overflow: hidden;
          user-select: none;
        }
        .ce-type-card-stripe {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          opacity: 0; transition: opacity .2s;
        }
        .ce-type-card:hover { border-color: var(--border2); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .ce-type-card:hover .ce-type-card-stripe { opacity: 1; }

        .ce-type-card--qcm.active { border-color: var(--primary); background: var(--primary-light); box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .ce-type-card--qcm.active .ce-type-card-stripe { opacity: 1; background: var(--primary); }
        .ce-type-card--qcm .ce-type-card-stripe { background: var(--primary); }

        .ce-type-card--pdf.active { border-color: var(--warning); background: var(--warning-bg); box-shadow: 0 0 0 3px rgba(245,158,11,.12); }
        .ce-type-card--pdf.active .ce-type-card-stripe { opacity: 1; background: var(--warning); }
        .ce-type-card--pdf .ce-type-card-stripe { background: var(--warning); }

        .ce-type-icon {
          width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ce-type-card--qcm .ce-type-icon { background: var(--primary-light); color: var(--primary); }
        .ce-type-card--pdf .ce-type-icon { background: var(--warning-bg); color: var(--warning); }
        .ce-type-card--qcm.active .ce-type-icon { background: white; }
        .ce-type-card--pdf.active .ce-type-icon { background: white; }

        .ce-type-name { font-family: var(--font-d); font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 3px; }
        .ce-type-card--qcm.active .ce-type-name { color: var(--primary); }
        .ce-type-card--pdf.active .ce-type-name { color: var(--warning); }
        .ce-type-desc { font-size: 12px; color: var(--muted); line-height: 1.55; }

        .ce-type-check {
          position: absolute; top: 14px; right: 14px;
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .ce-type-card--qcm.active .ce-type-check { background: var(--primary); border-color: var(--primary); }
        .ce-type-card--pdf.active .ce-type-check { background: var(--warning); border-color: var(--warning); }

        /* ═══ CARD ═══ */
        .ce-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 0; margin-bottom: 16px; box-shadow: var(--shadow-sm); overflow: hidden; transition: border-color .2s; }
        .ce-card:focus-within { border-color: var(--border-focus); }
        .ce-card-stripe-top { height: 3px; width: 100%; }
        .ce-card-body { padding: 24px 26px 26px; }
        .ce-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }

        .ce-step { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: var(--font-d); flex-shrink: 0; }
        .ce-step--1 { background: var(--primary-light); border: 1px solid #c7d2fe; color: var(--primary); }
        .ce-step--2 { background: var(--warning-bg); border: 1px solid var(--warning-border); color: var(--warning); }
        .ce-step--3 { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success); }

        .ce-card-label { font-family: var(--font-d); font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -.2px; }
        .ce-card-count { margin-left: auto; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 100px; }

        .ce-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 560px) { .ce-grid-2 { grid-template-columns: 1fr; } }

        .ce-field { display: flex; flex-direction: column; gap: 5px; }
        .ce-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); }

        .ce-input, .ce-textarea {
          background: var(--surface2); border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-body);
          font-family: var(--font-b); font-size: 14px;
          padding: 10px 13px; width: 100%; outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
          -webkit-appearance: none;
        }
        .ce-input:focus, .ce-textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(99,102,241,.10); background: var(--surface); }
        .ce-input::placeholder, .ce-textarea::placeholder { color: var(--light); }
        .ce-textarea { resize: vertical; min-height: 88px; line-height: 1.6; }

        .ce-input-wrap { position: relative; display: flex; align-items: center; }
        .ce-input-wrap .ce-input { padding-right: 46px; }
        .ce-input-unit { position: absolute; right: 12px; color: var(--muted); font-size: 12px; font-weight: 600; pointer-events: none; }

        /* toggle */
        .ce-toggle-row { display: flex; align-items: center; justify-content: space-between; background: var(--primary-light); border: 1.5px solid #c7d2fe; border-radius: var(--radius-sm); padding: 13px 15px; cursor: pointer; transition: border-color .18s; user-select: none; }
        .ce-toggle-row:hover { border-color: var(--primary); }
        .ce-toggle-info { flex: 1; }
        .ce-toggle-title { font-size: 14px; font-weight: 600; color: var(--primary); }
        .ce-toggle-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .ce-switch { width: 38px; height: 21px; border-radius: 11px; background: #c7d2fe; border: 1.5px solid #a5b4fc; position: relative; transition: background .2s, border-color .2s; flex-shrink: 0; margin-left: 16px; }
        .ce-switch--on { background: var(--primary); border-color: var(--primary); }
        .ce-switch-thumb { position: absolute; top: 2px; left: 2px; width: 15px; height: 15px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
        .ce-switch--on .ce-switch-thumb { transform: translateX(17px); }

        /* ═══ PDF UPLOAD ZONE ═══ */
        .ce-pdf-zone {
          border: 2px dashed var(--warning-border);
          border-radius: var(--radius-md);
          background: var(--warning-bg);
          padding: 36px 20px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
          cursor: pointer; transition: all .2s; text-align: center;
          position: relative;
        }
        .ce-pdf-zone:hover, .ce-pdf-zone--drag { border-color: var(--warning); background: #fef3c7; }
        .ce-pdf-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        .ce-pdf-icon { width: 52px; height: 52px; border-radius: 14px; background: white; display: flex; align-items: center; justify-content: center; color: var(--warning); box-shadow: var(--shadow-sm); }
        .ce-pdf-zone-title { font-family: var(--font-d); font-size: 15px; font-weight: 800; color: var(--warning); }
        .ce-pdf-zone-sub { font-size: 12px; color: var(--muted); }

        .ce-pdf-file-selected {
          display: flex; align-items: center; gap: 12px;
          background: white; border: 1.5px solid var(--warning-border);
          border-radius: var(--radius-md); padding: 14px 16px; margin-top: 12px;
          box-shadow: var(--shadow-xs);
        }
        .ce-pdf-file-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--warning-bg); display: flex; align-items: center; justify-content: center; color: var(--warning); flex-shrink: 0; }
        .ce-pdf-file-name { font-size: 13px; font-weight: 600; color: var(--text-body); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ce-pdf-file-size { font-size: 11px; color: var(--muted); }
        .ce-pdf-remove { background: none; border: none; color: var(--light); cursor: pointer; padding: 4px; border-radius: 6px; transition: color .15s, background .15s; }
        .ce-pdf-remove:hover { color: var(--danger); background: rgba(239,68,68,.08); }

        /* ═══ QCM BUILDER ═══ */
        .ce-qbuilder { background: var(--success-bg); border: 1.5px dashed var(--success-border); border-radius: var(--radius-md); padding: 18px; }
        .ce-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-bottom: 14px; }
        @media (max-width: 480px) { .ce-options-grid { grid-template-columns: 1fr; } }
        .ce-option-field { display: flex; align-items: center; gap: 7px; }
        .ce-option-idx { width: 26px; height: 26px; border-radius: 7px; background: var(--surface); border: 1.5px solid var(--success-border); color: var(--success); font-size: 11px; font-weight: 800; font-family: var(--font-d); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all .15s; }
        .ce-option-idx:hover { border-color: var(--success); }
        .ce-option-idx--correct { background: var(--success); border-color: var(--success); color: #fff; }
        .ce-correct-hint { font-size: 12px; color: var(--success); opacity: .7; margin-bottom: 10px; }
        .ce-correct-hint strong { opacity: 1; }
        .ce-add-btn { display: inline-flex; align-items: center; gap: 7px; background: var(--surface); border: 1.5px solid var(--success-border); color: var(--success); font-family: var(--font-b); font-size: 13px; font-weight: 700; padding: 9px 15px; border-radius: var(--radius-sm); cursor: pointer; transition: all .15s; margin-top: 4px; }
        .ce-add-btn:hover { background: var(--success); color: #fff; border-color: var(--success); transform: translateY(-1px); }

        .ce-qlist { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; }
        .ce-qitem { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px; box-shadow: var(--shadow-xs); transition: border-color .2s; }
        .ce-qitem:hover { border-color: #c7d2fe; }
        .ce-qitem-num { font-family: var(--font-d); font-size: 11px; font-weight: 800; color: var(--primary); background: var(--primary-light); border: 1px solid #c7d2fe; border-radius: 6px; padding: 3px 8px; flex-shrink: 0; margin-top: 1px; }
        .ce-qitem-body { flex: 1; min-width: 0; }
        .ce-qitem-prompt { font-size: 14px; font-weight: 600; color: var(--text-body); margin-bottom: 8px; line-height: 1.4; }
        .ce-qitem-opts { display: flex; flex-wrap: wrap; gap: 5px; }
        .ce-qitem-opt { font-size: 12px; padding: 3px 9px; border-radius: 6px; border: 1px solid var(--border2); color: var(--muted); background: var(--surface2); }
        .ce-qitem-opt--correct { background: var(--success-bg); border-color: var(--success-border); color: var(--success); font-weight: 600; }
        .ce-qitem-del { background: none; border: none; color: var(--light); cursor: pointer; padding: 5px; border-radius: 7px; transition: color .15s, background .15s; flex-shrink: 0; display: flex; }
        .ce-qitem-del:hover { color: var(--danger); background: rgba(239,68,68,.08); }

        /* ═══ ERROR / FOOTER ═══ */
        .ce-error { background: #fef2f2; border: 1px solid #fecaca; border-left: 3px solid var(--danger); color: #b91c1c; border-radius: var(--radius-sm); padding: 13px 16px; margin-bottom: 18px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 9px; }

        .ce-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
        .ce-cancel-btn { background: var(--surface2); border: 1.5px solid var(--border); color: var(--muted); font-family: var(--font-b); font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: var(--radius-sm); cursor: pointer; text-decoration: none; transition: color .15s, border-color .15s, background .15s; display: inline-flex; align-items: center; }
        .ce-cancel-btn:hover { color: var(--text); border-color: var(--border2); background: var(--surface3); }
        .ce-submit-btn { background: var(--primary); border: none; color: #fff; font-family: var(--font-d); font-size: 14px; font-weight: 700; padding: 11px 26px; border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all .18s; box-shadow: var(--shadow-primary); letter-spacing: .1px; }
        .ce-submit-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 12px 28px rgba(99,102,241,.35); }
        .ce-submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .ce-spin { animation: spin 0.7s linear infinite; }
      `}</style>

      <div className="ce-root">
        <div className="ce-topbar" />
        <div className="ce-page">

          <a href="/professor/dashboard" className="ce-back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Retour au dashboard
          </a>

          <div className="ce-header">
            <h1 className="ce-title">Créer un examen</h1>
            <p className="ce-subtitle">Configurez votre examen et choisissez le format QCM ou PDF</p>
          </div>

          {error && (
            <div className="ce-error">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={submit}>

            {/* ── TYPE SELECTOR ── */}
            <div className="ce-type-section">
              <span className="ce-type-heading">Type d'examen</span>
              <div className="ce-type-grid">

                {/* QCM */}
                <div
                  className={`ce-type-card ce-type-card--qcm ${examType === "qcm" ? "active" : ""}`}
                  onClick={() => setExamType("qcm")}
                >
                  <div className="ce-type-card-stripe" />
                  <div className="ce-type-check">
                    {examType === "qcm" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className="ce-type-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="ce-type-name">QCM interactif</p>
                    <p className="ce-type-desc">Créez des questions à choix multiples. Les étudiants répondent directement en ligne.</p>
                  </div>
                </div>

                {/* PDF */}
                <div
                  className={`ce-type-card ce-type-card--pdf ${examType === "pdf" ? "active" : ""}`}
                  onClick={() => setExamType("pdf")}
                >
                  <div className="ce-type-card-stripe" />
                  <div className="ce-type-check">
                    {examType === "pdf" && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className="ce-type-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
                    </svg>
                  </div>
                  <div>
                    <p className="ce-type-name">Examen PDF</p>
                    <p className="ce-type-desc">Uploadez un fichier PDF. Les étudiants le consultent et soumettent leurs réponses.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* ── FORM (shown only after type selection) ── */}
            {examType && (
              <>
                {/* ── 1. Informations générales — stripe indigo ── */}
                <div className="ce-card">
                  <div className="ce-card-stripe-top" style={{ background: "var(--primary)" }} />
                  <div className="ce-card-body">
                    <div className="ce-card-head">
                      <span className="ce-step ce-step--1">1</span>
                      <span className="ce-card-label">Informations générales</span>
                    </div>
                    <div className="ce-field" style={{ marginBottom: 12 }}>
                      <label className="ce-label">Titre de l'examen *</label>
                      <input className="ce-input" placeholder="ex : Examen de mathématiques — Semestre 2" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="ce-field">
                      <label className="ce-label">Description</label>
                      <textarea className="ce-textarea" placeholder="Instructions, contexte ou objectifs de l'examen…" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* ── 2. Paramètres — stripe warning ── */}
                <div className="ce-card">
                  <div className="ce-card-stripe-top" style={{ background: "var(--warning)" }} />
                  <div className="ce-card-body">
                    <div className="ce-card-head">
                      <span className="ce-step ce-step--2">2</span>
                      <span className="ce-card-label">Paramètres</span>
                    </div>
                    <div className="ce-grid-2" style={{ marginBottom: 12 }}>
                      <div className="ce-field">
                        <label className="ce-label">Durée</label>
                        <div className="ce-input-wrap">
                          <input className="ce-input" type="number" min="1" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
                          <span className="ce-input-unit">min</span>
                        </div>
                      </div>
                      <div className="ce-field">
                        <label className="ce-label">Tentatives max</label>
                        <input className="ce-input" type="number" min="1" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} />
                      </div>
                    </div>
                    <div className="ce-grid-2" style={{ marginBottom: examType === "qcm" ? 18 : 0 }}>
                      <div className="ce-field">
                        <label className="ce-label">Date de début</label>
                        <input className="ce-input" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                      </div>
                      <div className="ce-field">
                        <label className="ce-label">Date de fin</label>
                        <input className="ce-input" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                      </div>
                    </div>
                    {examType === "qcm" && (
                      <div className="ce-toggle-row" style={{ marginTop: 12 }} onClick={() => setShowCorrection((v) => !v)}>
                        <div className="ce-toggle-info">
                          <p className="ce-toggle-title">Afficher la correction</p>
                          <p className="ce-toggle-desc">Les étudiants voient les bonnes réponses après soumission</p>
                        </div>
                        <div className={`ce-switch ${showCorrection ? "ce-switch--on" : ""}`}>
                          <div className="ce-switch-thumb" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── 3. Contenu — stripe success (QCM) ou warning (PDF) ── */}
                <div className="ce-card">
                  <div className="ce-card-stripe-top" style={{ background: examType === "pdf" ? "var(--warning)" : "var(--success)" }} />
                  <div className="ce-card-body">
                    <div className="ce-card-head">
                      <span className="ce-step" style={examType === "pdf"
                        ? { background: "var(--warning-bg)", border: "1px solid var(--warning-border)", color: "var(--warning)" }
                        : { background: "var(--success-bg)", border: "1px solid var(--success-border)", color: "var(--success)" }
                      }>3</span>
                      <span className="ce-card-label">
                        {examType === "pdf" ? "Fichier PDF" : "Questions QCM"}
                      </span>
                      {examType === "qcm" && questions.length > 0 && (
                        <span className="ce-card-count" style={{ background: "var(--success-bg)", color: "var(--success)", border: "1px solid var(--success-border)" }}>
                          {questions.length} question{questions.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* PDF upload zone */}
                    {examType === "pdf" && (
                      <>
                        <div
                          className={`ce-pdf-zone ${pdfDragOver ? "ce-pdf-zone--drag" : ""}`}
                          onDragOver={(e) => { e.preventDefault(); setPdfDragOver(true); }}
                          onDragLeave={() => setPdfDragOver(false)}
                          onDrop={handleDrop}
                        >
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handlePdfChange(e.target.files[0])}
                          />
                          <div className="ce-pdf-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/>
                            </svg>
                          </div>
                          <div>
                            <p className="ce-pdf-zone-title">Glissez votre PDF ici</p>
                            <p className="ce-pdf-zone-sub">ou cliquez pour parcourir vos fichiers</p>
                          </div>
                          <span style={{ fontSize: 11, color: "var(--light)", background: "white", padding: "3px 10px", borderRadius: 100, border: "1px solid var(--border2)" }}>
                            Fichiers .pdf uniquement
                          </span>
                        </div>

                        {pdfFile && (
                          <div className="ce-pdf-file-selected">
                            <div className="ce-pdf-file-icon">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="ce-pdf-file-name">{pdfFile.name}</p>
                              <p className="ce-pdf-file-size">{(pdfFile.size / 1024).toFixed(0)} Ko</p>
                            </div>
                            <button type="button" className="ce-pdf-remove" onClick={() => setPdfFile(null)} title="Supprimer">
                              <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* QCM builder */}
                    {examType === "qcm" && (
                      <>
                        <div className="ce-qbuilder">
                          <div className="ce-field" style={{ marginBottom: 12 }}>
                            <label className="ce-label" style={{ color: "var(--success)" }}>Énoncé de la question</label>
                            <input className="ce-input" placeholder="ex : Quelle est la dérivée de x² ?" value={qPrompt} onChange={(e) => setQPrompt(e.target.value)} />
                          </div>
                          <label className="ce-label" style={{ display: "block", marginBottom: 6, color: "var(--success)" }}>Options de réponse</label>
                          <p className="ce-correct-hint">Cliquez sur le <strong>numéro</strong> pour marquer la bonne réponse</p>
                          <div className="ce-options-grid">
                            {qOptions.map((opt, i) => (
                              <div className="ce-option-field" key={i}>
                                <div className={`ce-option-idx ${qCorrectIndex === i ? "ce-option-idx--correct" : ""}`} onClick={() => setQCorrectIndex(i)}>{i + 1}</div>
                                <input className="ce-input" style={{ flex: 1 }} placeholder={`Option ${i + 1}`} value={opt}
                                  onChange={(e) => { const c = [...qOptions]; c[i] = e.target.value; setQOptions(c); }} />
                              </div>
                            ))}
                          </div>
                          <button type="button" className="ce-add-btn" onClick={addQuestion}>
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            Ajouter la question
                          </button>
                        </div>

                        {questions.length > 0 && (
                          <div className="ce-qlist">
                            {questions.map((q, i) => (
                              <div className="ce-qitem" key={i}>
                                <span className="ce-qitem-num">Q{i + 1}</span>
                                <div className="ce-qitem-body">
                                  <p className="ce-qitem-prompt">{q.prompt}</p>
                                  <div className="ce-qitem-opts">
                                    {q.options.map((o, j) => (
                                      <span key={j} className={`ce-qitem-opt ${j === q.correctIndex ? "ce-qitem-opt--correct" : ""}`}>
                                        {o || `Option ${j + 1}`}{j === q.correctIndex && " ✓"}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button type="button" className="ce-qitem-del" onClick={() => removeQuestion(i)}>
                                  <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="ce-footer">
                  <a href="/professor/dashboard" className="ce-cancel-btn">Annuler</a>
                  <button type="submit" className="ce-submit-btn" disabled={saving}>
                    {saving ? (
                      <>
                        <svg className="ce-spin" width="14" height="14" viewBox="0 0 15 15" fill="none">
                          <circle cx="7.5" cy="7.5" r="6" stroke="rgba(255,255,255,.3)" strokeWidth="2"/>
                          <path d="M7.5 1.5a6 6 0 016 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Enregistrement…
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M2.5 8l3.5 3.5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Enregistrer l'examen
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </form>
        </div>
      </div>
    </>
  );
}