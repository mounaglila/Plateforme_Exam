import React, { useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { getMyProfessorExams, publishProfessorExam, deleteProfessorExam } from "../../api/professor";
import { getStoredAuth } from "../../api/auth";

export default function ExamsList() {
  const history = useHistory();
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const authUser = getStoredAuth().user || {};
  const displayName = authUser.name || authUser.email || "Enseignant";

  const logout = () => {
    localStorage.removeItem("auth");
    history.push("/login");
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyProfessorExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Impossible de charger les examens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(ex => ex.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [exams, searchTerm]);

  const onPublish = async (id) => {
    try {
      setPublishingId(id);
      await publishProfessorExam(id);
      await load();
    } catch (e) {
      setError(e.message || "Échec de la publication");
    } finally {
      setPublishingId(null);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet examen ?")) return;
    try {
      await deleteProfessorExam(id);
      await load();
    } catch (e) {
      setError(e.message || "Échec de la suppression");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --sidebar-width: 260px;
          --bg: #f8fafc;
          --surface: #ffffff;
          --primary: #6366f1; /* Indigo */
          --success: #10b981; /* Emeraude */
          --warning: #f59e0b; /* Ambre */
          --danger: #ef4444; /* Rouge */
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .el-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }

        /* ── SIDEBAR ── */
        .el-sidebar {
          width: var(--sidebar-width);
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .el-logo {
          padding: 26px 22px 22px;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border);
        }
        .el-logo-mark {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, var(--primary) 0%, #818cf8 100%);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(99,102,241,0.3);
          flex-shrink: 0;
        }

        .el-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
        .el-nav-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px 6px; }
        .el-nav-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          color: var(--text-main); text-decoration: none;
          font-size: 14px; font-weight: 600; transition: all 0.15s ease;
        }
        .el-nav-link:hover { background: #f8fafc; }
        .el-nav-link.active { background: #eef2ff; color: var(--primary); }
        .el-nav-link-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; flex-shrink: 0; }
        .el-nav-link:hover .el-nav-link-icon { background: var(--border); }
        .el-nav-link.active .el-nav-link-icon { background: rgba(99,102,241,0.10); color: var(--primary); }

        .el-profile-zone {
          padding: 14px 16px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
          background: #f8fafc;
        }
        .el-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;
        }
        .el-profile-info { flex: 1; min-width: 0; }
        .el-profile-name { font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .el-profile-role { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
        .el-logout-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .el-logout-btn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: var(--danger);
        }

        /* ── MAIN CONTENT ── */
        .el-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; }

        /* Top Bar */
        .el-topbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 40px; gap: 20px;
        }
        .el-search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .el-search-input {
          width: 100%; padding: 12px 20px 12px 45px;
          border-radius: 15px; border: 1px solid var(--border);
          background: white; outline: none; transition: 0.2s;
        }
        .el-search-input:focus { border-color: var(--primary); }
        .el-search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .el-create-btn {
          background: var(--primary); color: white; padding: 12px 20px;
          border-radius: 14px; font-weight: 700; text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: 0.3s;
          box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
        }
        .el-create-btn:hover { transform: translateY(-2px); opacity: 0.9; }

        /* Exam Cards */
        .el-exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        .el-card {
          background: white; border-radius: 28px; padding: 25px; border: 1px solid var(--border);
          display: flex; flex-direction: column; transition: 0.3s;
        }
        .el-card:hover { border-color: var(--primary); transform: translateY(-4px); }

        .el-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px;
          border-radius: 10px; font-size: 11px; font-weight: 700; margin-bottom: 15px;
        }
        .el-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .el-badge--pub { background: #ecfdf5; color: var(--success); }
        .el-badge--draft { background: #fffbeb; color: var(--warning); }

        .el-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .el-btn {
          flex: 1; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: 700;
          text-align: center; text-decoration: none; border: none; cursor: pointer; transition: 0.2s;
        }
        .el-btn--edit { background: #f1f5f9; color: var(--text-main); }
        .el-btn--pub { background: var(--primary); color: white; }
        .el-btn--pub:disabled { opacity: 0.55; cursor: not-allowed; }
        .el-btn--del { background: #fee2e2; color: var(--danger); flex: 0.5; }
        .el-btn--del:hover { background: var(--danger); color: white; }

        .el-skeleton { height: 280px; background: white; border-radius: 28px; border: 1px solid var(--border); animation: pulse 1.5s infinite; }
        @keyframes pulse { 50% { opacity: 0.5; } }

        .el-empty {
          text-align: center; padding: 60px 20px;
        }
        .el-empty-icon { font-size: 60px; margin-bottom: 20px; }
        .el-empty-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 10px; }
        .el-empty-text { color: var(--text-muted); margin-bottom: 30px; }
      `}</style>

      <div className="el-layout">
        {/* SIDEBAR */}
        <aside className="el-sidebar">
          <div className="el-logo">
            <div className="el-logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            EduSmart
          </div>
          
          <nav className="el-nav">
            <div className="el-nav-label">Menu</div>
            <Link to="/professor/dashboard" className="el-nav-link">
              <span className="el-nav-link-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              </span>
              Tableau de bord
            </Link>
            <Link to="/professor/exams-list" className="el-nav-link active">
              <span className="el-nav-link-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </span>
              Mes Examens
            </Link>
          </nav>

          <div className="el-profile-zone">
            <div className="el-avatar">
              {(displayName || "P")
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="el-profile-info">
              <p className="el-profile-name">{displayName}</p>
              <p className="el-profile-role">Enseignant</p>
            </div>
            <button className="el-logout-btn" onClick={logout} title="Se déconnecter">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="el-main">
          {error && (
            <p style={{ color: "#dc2626", marginBottom: 16 }} role="alert">
              {error}
            </p>
          )}
          {/* TOPBAR */}
          <div className="el-topbar">
            <div className="el-search-wrapper">
              <span className="el-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input 
                type="text" 
                className="el-search-input" 
                placeholder="Rechercher un examen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/professor/exams/new" className="el-create-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Créer un examen
            </Link>
          </div>

          <h1 style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--text-main)', marginBottom:10}}>Mes Examens</h1>
          <p style={{color:'var(--text-muted)', marginBottom:35}}>Gérez et consultez tous vos examens publiés</p>

          {/* EXAM GRID */}
          <div className="el-exam-grid">
            {loading ? [1,2,3].map(i => <div key={i} className="el-skeleton"/>) :
             filteredExams.length === 0 ? (
              <div className="el-empty" style={{gridColumn:'1/-1'}}>
                <div className="el-empty-icon">📋</div>
                <p className="el-empty-title">Aucun examen trouvé</p>
                <p className="el-empty-text">Créez votre premier examen pour commencer</p>
                <Link to="/professor/exams/new" className="el-create-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Créer un examen
                </Link>
              </div>
            ) :
             filteredExams.map(ex => (
              <div key={ex._id} className="el-card">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <span className={`el-badge ${ex.published ? 'el-badge--pub' : 'el-badge--draft'}`}>
                    <span className="el-badge-dot" />
                    {ex.published ? 'Publié' : 'Brouillon'}
                  </span>
                  {ex.published && ex.adminApproved === false && (
                    <span className="el-badge el-badge--draft">
                      <span className="el-badge-dot" />
                      En attente validation
                    </span>
                  )}
                </div>
                
                <h3 style={{fontSize:19, fontWeight:700, marginBottom:8}}>{ex.title}</h3>
                <p style={{fontSize:14, color:'var(--text-muted)', marginBottom:20, flexGrow:1}}>
                  {ex.description || "Aucune description fournie."}
                </p>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20}}>
                  <div style={{background:'#f8fafc', padding:10, borderRadius:12}}>
                    <p style={{fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase'}}>Durée</p>
                    <p style={{fontSize:13, fontWeight:700}}>{ex.durationMinutes} min</p>
                  </div>
                  <div style={{background:'#f8fafc', padding:10, borderRadius:12}}>
                    <p style={{fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase'}}>Questions</p>
                    <p style={{fontSize:13, fontWeight:700}}>{(ex.questions || []).length}</p>
                  </div>
                </div>

                <div className="el-actions">
                  <Link to={`/professor/exams/${ex._id}`} className="el-btn el-btn--edit">Modifier</Link>
                  <Link to={`/professor/exams/${ex._id}/submissions`} className="el-btn" style={{background: "#10b981", color: "white", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6}}>📊 Soumissions</Link>
                  {!ex.published && (
                    <button
                      onClick={() => onPublish(ex._id)}
                      disabled={publishingId === ex._id}
                      className="el-btn el-btn--pub"
                    >
                      {publishingId === ex._id ? "..." : "Publier"}
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(ex._id)}
                    className="el-btn el-btn--del"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
