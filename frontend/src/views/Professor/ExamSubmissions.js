import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getExamSubmissions, getProfessorExamById } from "../../api/professor";
import { getStoredAuth } from "../../api/auth";

export default function ExamSubmissions() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  
  const authUser = getStoredAuth().user || {};
  const displayName = authUser.name || authUser.email || "Enseignant";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const examData = await getProfessorExamById(examId);
        setExam(examData);
        
        const subData = await getExamSubmissions(examId);
        setSubs(Array.isArray(subData) ? subData : []);
      } catch (e) {
        setError(e.message || "Erreur au chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [examId]);

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

        .es-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }

        .es-sidebar {
          width: var(--sidebar-width);
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .es-logo {
          padding: 30px;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          display: flex; align-items: center; gap: 10px;
        }

        .es-nav { flex: 1; padding: 10px 20px; }
        .es-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 15px; border-radius: 12px;
          color: var(--text-muted); text-decoration: none;
          font-weight: 600; transition: 0.2s; margin-bottom: 5px;
        }
        .es-nav-link:hover { background: #f1f5f9; color: var(--text-main); }

        .es-profile-zone {
          padding: 20px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .es-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--text-main);
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
        }

        .es-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; }

        .es-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border);
        }

        .es-title {
          font-family: var(--font-display);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }

        .es-back-btn {
          padding: 10px 16px;
          background: var(--border);
          color: var(--text-main);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          text-decoration: none;
          transition: 0.3s;
        }

        .es-back-btn:hover {
          background: #d1d5db;
        }

        .es-card {
          background: white;
          border-radius: 20px;
          padding: 25px;
          border: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .es-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .es-stat {
          background: white;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .es-stat-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .es-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--primary);
        }

        .es-alert {
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          font-weight: 500;
        }

        .es-alert--error {
          background: #fee2e2;
          color: #dc2626;
        }

        .es-table {
          width: 100%;
          border-collapse: collapse;
        }

        .es-table thead {
          background: #f8fafc;
          border-bottom: 2px solid var(--border);
        }

        .es-table th {
          padding: 16px;
          text-align: left;
          font-weight: 700;
          color: var(--text-main);
          font-size: 14px;
        }

        .es-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          color: var(--text-main);
        }

        .es-table tbody tr:hover {
          background: #f8fafc;
        }

        .es-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .es-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .es-score {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #ecfdf5;
          color: var(--success);
          font-weight: 700;
        }

        .es-loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .es-sidebar { width: 0; display: none; }
          .es-main { margin-left: 0; padding: 20px; }
          .es-title { font-size: 24px; }
          .es-table { font-size: 12px; }
          .es-table th, .es-table td { padding: 10px; }
        }
      `}</style>

      <div className="es-layout">
        {/* SIDEBAR */}
        <aside className="es-sidebar">
          <div className="es-logo">
            <div style={{width:32, height:32, background:'var(--primary)', borderRadius:8}}></div>
            EduSmart
          </div>
          
          <nav className="es-nav">
            <Link to="/professor/dashboard" className="es-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Tableau de bord
            </Link>
            <Link to="/professor/exams-list" className="es-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Mes Examens
            </Link>
          </nav>

          <div className="es-profile-zone">
            <div className="es-avatar">
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
        <main className="es-main">
          {/* HEADER */}
          <div className="es-header">
            <div>
              <h1 className="es-title">📊 Soumissions</h1>
              {exam && <p style={{color:'var(--text-muted)', margin:'8px 0 0'}}>{exam.title}</p>}
            </div>
            <Link to={`/professor/exams/${examId}`} className="es-back-btn">
              ← Retour
            </Link>
          </div>

          {/* ERROR */}
          {error && <div className="es-alert es-alert--error">{error}</div>}

          {/* LOADING */}
          {loading && <div className="es-loading">Chargement des soumissions...</div>}

          {/* CONTENT */}
          {!loading && exam && (
            <>
              {/* STATS */}
              <div className="es-stats-row">
                <div className="es-stat">
                  <div className="es-stat-label">Total Soumissions</div>
                  <div className="es-stat-value">{subs.length}</div>
                </div>
                <div className="es-stat">
                  <div className="es-stat-label">Durée de l'examen</div>
                  <div className="es-stat-value">{exam.durationMinutes} min</div>
                </div>
                <div className="es-stat">
                  <div className="es-stat-label">Score Moyen</div>
                  <div className="es-stat-value">
                    {subs.length > 0 
                      ? (subs.reduce((sum, s) => sum + (s.score || 0), 0) / subs.length).toFixed(1)
                      : "—"
                    }
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="es-card">
                {subs.length === 0 ? (
                  <div className="es-empty">
                    <div className="es-empty-icon">📭</div>
                    <p style={{fontSize:16, fontWeight:600}}>Aucune soumission</p>
                    <p style={{fontSize:14, color:'var(--text-muted)'}}>Les étudiants qui complètent l'examen apparaîtront ici</p>
                  </div>
                ) : (
                  <table className="es-table">
                    <thead>
                      <tr>
                        <th>Étudiant</th>
                        <th>Email</th>
                        <th>Date de soumission</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subs.map((s) => (
                        <tr key={s._id}>
                          <td style={{fontWeight:600}}>{s.student?.name || "Inconnu"}</td>
                          <td>{s.student?.email || "—"}</td>
                          <td>{new Date(s.createdAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}</td>
                          <td>
                            {s.score !== null && s.score !== undefined ? (
                              <span className="es-score">{s.score}</span>
                            ) : (
                              <span style={{color:'var(--text-muted)'}}>—</span>
                            )}
                          </td>
                          <td>
                            <Link
                              to={`/professor/exams/${examId}/submissions/${s._id}`}
                              style={{
                                textDecoration: "none",
                                fontWeight: 700,
                                color: "var(--primary)",
                              }}
                            >
                              Corriger
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}