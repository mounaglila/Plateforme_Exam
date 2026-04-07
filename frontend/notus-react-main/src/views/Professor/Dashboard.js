import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfessorExams, publishProfessorExam } from "../../api/professor";

/* ─── Utilitaire de date ─── */
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function ProfessorDashboard() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => { load(); }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(ex => ex.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [exams, searchTerm]);

  const stats = useMemo(() => {
    const total = exams.length;
    const published = exams.filter((e) => e.published).length;
    return { total, published, drafts: total - published };
  }, [exams]);

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
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .pd-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }

        /* ── SIDEBAR ── */
        .pd-sidebar {
          width: var(--sidebar-width);
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .pd-logo {
          padding: 30px;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          display: flex; align-items: center; gap: 10px;
        }

        .pd-nav { flex: 1; padding: 10px 20px; }
        .pd-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 15px; border-radius: 12px;
          color: var(--text-muted); text-decoration: none;
          font-weight: 600; transition: 0.2s; margin-bottom: 5px;
        }
        .pd-nav-link:hover, .pd-nav-link.active {
          background: #f1f5f9; color: var(--text-main);
        }
        .pd-nav-link.active { background: #eef2ff; color: var(--primary); }

        .pd-profile-zone {
          padding: 20px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .pd-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          background: var(--text-main);
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
        }

        /* ── MAIN CONTENT ── */
        .pd-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; }

        /* Top Bar */
        .pd-topbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 40px; gap: 20px;
        }
        .pd-search-wrapper { position: relative; flex: 1; max-width: 400px; }
        .pd-search-input {
          width: 100%; padding: 12px 20px 12px 45px;
          border-radius: 15px; border: 1px solid var(--border);
          background: white; outline: none; transition: 0.2s;
        }
        .pd-search-input:focus { border-color: var(--primary); }
        .pd-search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .pd-create-btn {
          background: var(--primary); color: white; padding: 12px 20px;
          border-radius: 14px; font-weight: 700; text-decoration: none;
          display: flex; align-items: center; gap: 8px; transition: 0.3s;
          box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
        }
        .pd-create-btn:hover { transform: translateY(-2px); opacity: 0.9; }

        /* Stats */
        .pd-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .pd-stat-card {
          background: white; padding: 25px; border-radius: 24px; border: 1px solid var(--border);
        }
        .pd-stat-val { font-family: var(--font-display); font-size: 32px; font-weight: 800; }

        /* Exam Cards */
        .pd-exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        .pd-card {
          background: white; border-radius: 28px; padding: 25px; border: 1px solid var(--border);
          display: flex; flex-direction: column; transition: 0.3s;
        }
        .pd-card:hover { border-color: var(--primary); transform: translateY(-4px); box-shadow: var(--shadow); }

        .pd-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px;
          border-radius: 10px; font-size: 11px; font-weight: 700; margin-bottom: 15px;
        }
        .pd-badge--pub { background: #ecfdf5; color: var(--success); }
        .pd-badge--draft { background: #fffbeb; color: var(--warning); }

        .pd-actions { display: flex; gap: 10px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .pd-btn {
          flex: 1; padding: 10px; border-radius: 12px; font-size: 13px; font-weight: 700;
          text-align: center; text-decoration: none; border: none; cursor: pointer; transition: 0.2s;
        }
        .pd-btn--edit { background: #f1f5f9; color: var(--text-main); }
        .pd-btn--pub { background: var(--primary); color: white; }

        .pd-skeleton { height: 280px; background: white; border-radius: 28px; border: 1px solid var(--border); animation: pulse 1.5s infinite; }
        @keyframes pulse { 50% { opacity: 0.5; } }
      `}</style>

      <div className="pd-layout">
        {/* SIDEBAR */}
        <aside className="pd-sidebar">
          <div className="pd-logo">
            <div style={{width:32, height:32, background:'var(--primary)', borderRadius:8}}></div>
            EduSmart
          </div>
          
          <nav className="pd-nav">
            <Link to="/professor" className="pd-nav-link active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              Tableau de bord
            </Link>
            <Link to="/professor/exams" className="pd-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Mes Cours
            </Link>
            <Link to="/professor/results" className="pd-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
              Analyses
            </Link>
          </nav>

          <div className="pd-profile-zone">
            <div className="pd-avatar">DR</div>
            <div>
              <p style={{fontSize:14, fontWeight:700, color:'var(--text-main)'}}>Dr. Smith</p>
              <p style={{fontSize:12, color:'var(--text-muted)'}}>Enseignant</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="pd-main">
          {/* TOPBAR */}
          <div className="pd-topbar">
            <div className="pd-search-wrapper">
              <span className="pd-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input 
                type="text" 
                className="pd-search-input" 
                placeholder="Rechercher un examen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/professor/exams/new" className="pd-create-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Créer un examen
            </Link>
          </div>

          <h1 style={{fontFamily:'var(--font-display)', fontSize:32, color:'var(--text-main)', marginBottom:10}}>Dashboard Enseignant</h1>
          <p style={{color:'var(--text-muted)', marginBottom:35}}>Gérez vos évaluations et suivez la progression de vos étudiants.</p>

          {/* STATS */}
          <div className="pd-stats-row">
            <div className="pd-stat-card">
              <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Total Examens</p>
              <p className="pd-stat-val" style={{color:'var(--text-main)'}}>{stats.total}</p>
            </div>
            <div className="pd-stat-card">
              <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Publiés</p>
              <p className="pd-stat-val" style={{color:'var(--success)'}}>{stats.published}</p>
            </div>
            <div className="pd-stat-card">
              <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Brouillons</p>
              <p className="pd-stat-val" style={{color:'var(--warning)'}}>{stats.drafts}</p>
            </div>
          </div>

          {/* EXAM GRID */}
          <h2 style={{fontFamily:'var(--font-display)', fontSize:22, marginBottom:20}}>Mes sessions d'examens</h2>
          <div className="pd-exam-grid">
            {loading ? [1,2].map(i => <div key={i} className="pd-skeleton"/>) :
             filteredExams.map(ex => (
              <div key={ex._id} className="pd-card">
                <span className={`pd-badge ${ex.published ? 'pd-badge--pub' : 'pd-badge--draft'}`}>
                  {ex.published ? '● Publié' : '● Brouillon'}
                </span>
                
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
                    <p style={{fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase'}}>Début</p>
                    <p style={{fontSize:13, fontWeight:700}}>{fmt(ex.startAt)}</p>
                  </div>
                </div>

                <div className="pd-actions">
                  <Link to={`/professor/exams/${ex._id}`} className="pd-btn pd-btn--edit">Modifier</Link>
                  {!ex.published && (
                    <button 
                      onClick={() => onPublish(ex._id)} 
                      disabled={publishingId === ex._id}
                      className="pd-btn pd-btn--pub"
                    >
                      {publishingId === ex._id ? '...' : 'Publier'}
                    </button>
                  )}
                  <Link to={`/professor/exams/${ex._id}/submissions`} className="pd-btn pd-btn--edit" style={{flex:0.5}}>📊</Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}