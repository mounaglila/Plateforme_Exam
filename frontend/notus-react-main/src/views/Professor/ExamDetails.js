import React, { useEffect, useState } from "react";
import { useParams, useHistory, Link } from "react-router-dom";
import { getProfessorExamById, updateProfessorExam, deleteProfessorExam } from "../../api/professor";
import { getStoredAuth } from "../../api/auth";

export default function ExamDetails() {
  const { id } = useParams();
  const history = useHistory();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const authUser = getStoredAuth().user || {};
  const displayName = authUser.name || authUser.email || "Enseignant";
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    startAt: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfessorExamById(id);
        setExam(data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          durationMinutes: data.durationMinutes || 60,
          startAt: data.startAt ? new Date(data.startAt).toISOString().slice(0, 16) : "",
        });
      } catch (e) {
        setError(e.message || "Erreur lors du chargement de l'examen");
      }
    })();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "durationMinutes" ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("Le titre de l'examen est obligatoire");
      return;
    }
    if (formData.durationMinutes <= 0) {
      setError("La durée doit être positive");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsSaving(true);
      
      const updatePayload = {
        title: formData.title,
        description: formData.description,
        durationMinutes: formData.durationMinutes,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : null,
      };
      
      await updateProfessorExam(id, updatePayload);
      
      // Reload exam data
      const updatedExam = await getProfessorExamById(id);
      setExam(updatedExam);
      setSuccess("Examen modifié avec succès !");
      setIsEditing(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message || "Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet examen ? Cette action est irréversible.")) {
      return;
    }

    try {
      setError("");
      setIsDeleting(true);
      await deleteProfessorExam(id);
      setSuccess("Examen supprimé avec succès !");
      setTimeout(() => {
        history.push("/professor");
      }, 1500);
    } catch (e) {
      setError(e.message || "Erreur lors de la suppression");
      setIsDeleting(false);
    }
  };

  if (!exam && !error) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <p style={{ margin: "auto", color: "#64748b" }}>Chargement...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --sidebar-width: 260px;
          --bg: #f8fafc;
          --surface: #ffffff;
          --primary: #6366f1;
          --success: #10b981;
          --warning: #f59e0b;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .ed-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }

        .ed-sidebar {
          width: var(--sidebar-width);
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .ed-logo {
          padding: 30px;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          display: flex; align-items: center; gap: 10px;
        }

        .ed-nav { flex: 1; padding: 10px 20px; }
        .ed-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 15px; border-radius: 12px;
          color: var(--text-muted); text-decoration: none;
          font-weight: 600; transition: 0.2s; margin-bottom: 5px;
        }
        .ed-nav-link:hover { background: #f1f5f9; color: var(--text-main); }
        .ed-nav-link.active { background: #eef2ff; color: var(--primary); }

        .ed-profile-zone {
          padding: 20px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .ed-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--text-main);
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
        }

        .ed-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; }

        .ed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 20px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .ed-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .ed-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
        }
        .ed-badge--pub { background: #ecfdf5; color: var(--success); }
        .ed-badge--draft { background: #fffbeb; color: var(--warning); }

        .ed-btn {
          padding: 10px 16px;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .ed-btn--edit {
          background: var(--primary);
          color: white;
        }

        .ed-btn--edit:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .ed-btn--cancel {
          background: var(--border);
          color: var(--text-main);
          margin-right: 10px;
        }

        .ed-btn--save {
          background: var(--success);
          color: white;
          margin-left: 10px;
        }

        .ed-btn--save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ed-btn--delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .ed-btn--delete:hover {
          background: #fecaca;
        }

        .ed-btn--delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ed-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .ed-form-group {
          margin-bottom: 20px;
        }

        .ed-form-group label {
          display: block;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-main);
          font-size: 14px;
        }

        .ed-form-group input,
        .ed-form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.3s;
        }

        .ed-form-group input:focus,
        .ed-form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .ed-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .ed-alert {
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .ed-alert--error {
          background: #fee2e2;
          color: #dc2626;
        }

        .ed-alert--success {
          background: #dcfce7;
          color: #16a34a;
        }

        .ed-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ed-info-item {
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .ed-info-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .ed-info-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .ed-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 30px;
        }

        .ed-questions {
          margin-top: 24px;
        }

        .ed-question-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid var(--primary);
        }

        .ed-question-title {
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .ed-question-type {
          font-size: 13px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .ed-form-row { grid-template-columns: 1fr; }
          .ed-sidebar { width: 0; display: none; }
          .ed-main { margin-left: 0; padding: 20px; }
          .ed-title { font-size: 24px; }
        }
      `}</style>

      <div className="ed-layout">
        {/* SIDEBAR */}
        <aside className="ed-sidebar">
          <div className="ed-logo">
            <div style={{width:32, height:32, background:'var(--primary)', borderRadius:8}}></div>
            EduSmart
          </div>
          
          <nav className="ed-nav">
            <Link to="/professor" className="ed-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Tableau de bord
            </Link>
            <Link to="/professor/exams" className="ed-nav-link active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Mes Cours
            </Link>
            <Link to="/professor/results" className="ed-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              Analyses
            </Link>
          </nav>

          <div className="ed-profile-zone">
            <div className="ed-avatar">
              {(displayName || "P")
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p style={{fontSize:14, fontWeight:700, color:'var(--text-main)', margin:0}}>{displayName}</p>
              <p style={{fontSize:12, color:'var(--text-muted)', margin:0}}>Enseignant</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="ed-main">
          {error && <div className="ed-alert ed-alert--error">{error}</div>}
          {success && <div className="ed-alert ed-alert--success">{success}</div>}

          {exam && (
            <>
              {/* HEADER */}
              <div className="ed-header">
                <div>
                  <h1 className="ed-title">{exam.title}</h1>
                  <span className={`ed-badge ${exam.published ? 'ed-badge--pub' : 'ed-badge--draft'}`}>
                    {exam.published ? '● Publié' : '● Brouillon'}
                  </span>
                </div>
                {!isEditing && (
                  <button className="ed-btn ed-btn--edit" onClick={() => setIsEditing(true)}>
                    ✏️ Modifier
                  </button>
                )}
              </div>

              {/* EDIT MODE */}
              {isEditing ? (
                <div className="ed-card">
                  <h2 style={{fontSize:20, fontWeight:700, marginBottom:24, color:'var(--text-main)'}}>
                    Modifier l'examen
                  </h2>

                  <div className="ed-form-group">
                    <label>Titre de l'examen *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Ex: Examen de Mathématiques"
                    />
                  </div>

                  <div className="ed-form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Décrivez l'examen..."
                      rows="4"
                    />
                  </div>

                  <div className="ed-form-row">
                    <div className="ed-form-group">
                      <label>Durée (minutes) *</label>
                      <input
                        type="number"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="60"
                      />
                    </div>

                    <div className="ed-form-group">
                      <label>Date et heure de début</label>
                      <input
                        type="datetime-local"
                        name="startAt"
                        value={formData.startAt}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="ed-actions">
                    <button 
                      className="ed-btn ed-btn--delete" 
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '...' : '🗑️ Supprimer'}
                    </button>
                    <div>
                      <button 
                        className="ed-btn ed-btn--cancel" 
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Annuler
                      </button>
                      <button 
                        className="ed-btn ed-btn--save" 
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* VIEW MODE */}
                  <div className="ed-card">
                    <div className="ed-info-grid">
                      <div className="ed-info-item">
                        <div className="ed-info-label">Description</div>
                        <div className="ed-info-value">{exam.description || "—"}</div>
                      </div>
                      <div className="ed-info-item">
                        <div className="ed-info-label">Durée</div>
                        <div className="ed-info-value">{exam.durationMinutes} min</div>
                      </div>
                      <div className="ed-info-item">
                        <div className="ed-info-label">Date de début</div>
                        <div className="ed-info-value">
                          {exam.startAt 
                            ? new Date(exam.startAt).toLocaleDateString("fr-FR", { 
                                weekday: "short", 
                                year: "numeric", 
                                month: "short", 
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) 
                            : "—"
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QUESTIONS SECTION */}
                  {exam.questions && exam.questions.length > 0 && (
                    <div className="ed-card">
                      <h2 style={{fontSize:20, fontWeight:700, marginBottom:16, color:'var(--text-main)'}}>
                        Questions ({exam.questions.length})
                      </h2>
                      <div className="ed-questions">
                        {exam.questions.map((q, i) => (
                          <div key={q._id} className="ed-question-card">
                            <p className="ed-question-title">Q{i + 1}: {q.prompt}</p>
                            <p className="ed-question-type">Type: {q.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}