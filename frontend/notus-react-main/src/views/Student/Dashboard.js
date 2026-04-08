import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedExams, getMySubmissions } from "../../api/student";
import { getStoredAuth } from "../../api/auth";
import { getMyAnnouncements } from "../../api/announcements";

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const authUser = getStoredAuth().user || {};
  const displayName = authUser.name || authUser.email || "Étudiant";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [examsData, subsData, ann] = await Promise.all([
          getPublishedExams(),
          getMySubmissions(),
          getMyAnnouncements().catch(() => []),
        ]);
        setExams(Array.isArray(examsData) ? examsData : []);
        setSubs(Array.isArray(subsData) ? subsData : []);
        setAnnouncements(Array.isArray(ann) ? ann : []);
      } catch (e) {
        setError(e.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(ex => ex.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [exams, searchTerm]);

  const stats = useMemo(() => {
    const totalSubmissions = subs.length;
    const avg = totalSubmissions > 0
      ? (subs.reduce((acc, s) => acc + (Number(s.score) || 0), 0) / totalSubmissions).toFixed(1)
      : "0.0";
    return { totalAvailable: exams.length, totalSubmissions, avg };
  }, [exams, subs]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --sidebar-width: 260px;
          --bg: #f8fafc;
          --surface: #ffffff;
          --primary: #6366f1;
          --secondary: #0ea5e9;
          --success: #10b981;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .sd-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }

        /* ── SIDEBAR ── */
        .sd-sidebar {
          width: var(--sidebar-width);
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .sd-logo {
          padding: 30px;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          display: flex; align-items: center; gap: 10px;
        }

        .sd-nav { flex: 1; padding: 10px 20px; }
        .sd-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 15px; border-radius: 12px;
          color: var(--text-muted); text-decoration: none;
          font-weight: 600; transition: 0.2s; margin-bottom: 5px;
        }
        .sd-nav-link:hover, .sd-nav-link.active {
          background: #eef2ff; color: var(--primary);
        }

        .sd-profile-zone {
          padding: 20px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .sd-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
        }

        /* ── MAIN CONTENT ── */
        .sd-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; }

        /* Top Bar */
        .sd-topbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 40px; gap: 20px;
        }
        .sd-search-wrapper {
          position: relative; flex: 1; max-width: 500px;
        }
        .sd-search-input {
          width: 100%; padding: 12px 20px 12px 45px;
          border-radius: 15px; border: 1px solid var(--border);
          background: white; outline: none; transition: 0.2s;
        }
        .sd-search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .sd-search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        /* Grid & Components */
        .sd-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .sd-stat-card {
          background: white; padding: 25px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid var(--border);
        }
        .sd-stat-val { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--text-main); }

        .sd-exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .sd-exam-card {
          background: white; border-radius: 24px; padding: 25px; border: 1px solid var(--border);
          transition: 0.3s;
        }
        .sd-exam-card:hover { transform: translateY(-5px); border-color: var(--primary); }

        .sd-btn-pass {
          display: block; width: 100%; text-align: center; padding: 12px;
          background: var(--primary); color: white; border-radius: 12px;
          font-weight: 700; text-decoration: none; margin-top: 20px;
        }
      `}</style>

      <div className="sd-layout">
        {/* SIDEBAR */}
        <aside className="sd-sidebar">
          <div className="sd-logo">
            <div style={{width:32, height:32, background:'var(--primary)', borderRadius:8}}></div>
            EduSmart
          </div>
          
          <nav className="sd-nav">
            <Link to="/student" className="sd-nav-link active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Tableau de bord
            </Link>
            <Link to="/student/exams" className="sd-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              Mes Examens
            </Link>
            <Link to="/student/submissions" className="sd-nav-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              Résultats
            </Link>
          </nav>

          <div className="sd-profile-zone">
            <div className="sd-avatar">
              {(displayName || "E")
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p style={{fontSize:14, fontWeight:700, color:'var(--text-main)'}}>{displayName}</p>
              <p style={{fontSize:12, color:'var(--text-muted)'}}>Étudiant</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="sd-main">
          {error && (
            <p className="text-red-600 mb-4" role="alert">
              {error}
            </p>
          )}
          {/* TOPBAR */}
          <div className="sd-topbar">
            <div className="sd-search-wrapper">
              <span className="sd-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input 
                type="text" 
                className="sd-search-input" 
                placeholder="Rechercher un examen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{display:'flex', gap:15}}>
              <button style={{background:'white', border:'1px solid var(--border)', padding:'10px', borderRadius:'12px', cursor:'pointer'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path></svg>
              </button>
            </div>
          </div>

          <h1 className="sd-title">Bienvenue, {displayName.split(" ")[0] || "étudiant"} 👋</h1>
          <p className="sd-subtitle" style={{marginBottom:30}}>Voici ce qui se passe dans vos cours aujourd'hui.</p>

          {announcements.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 12 }}>Annonces</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {announcements.slice(0, 5).map((a) => (
                  <div
                    key={a._id}
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: 16,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p style={{ fontWeight: 700, margin: "0 0 6px" }}>{a.title}</p>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATS */}
          <div className="sd-stats-row">
            <div className="sd-stat-card">
              <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Examens à venir</p>
              <p className="sd-stat-val" style={{color:'var(--secondary)'}}>{stats.totalAvailable}</p>
            </div>
            <div className="sd-stat-card">
              <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Passés</p>
              <p className="sd-stat-val" style={{color:'var(--primary)'}}>{stats.totalSubmissions}</p>
            </div>
            <div className="sd-stat-card">
              <p style={{fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Moyenne</p>
              <p className="sd-stat-val" style={{color:'var(--success)'}}>{stats.avg}/20</p>
            </div>
          </div>

          {/* EXAM GRID */}
          <h2 style={{fontFamily:'var(--font-display)', fontSize:22, marginBottom:20}}>Examens disponibles</h2>
          <div className="sd-exam-grid">
            {loading ? [1,2].map(i => <div key={i} className="sd-skeleton" style={{height:250}}/>) :
             filteredExams.map(ex => (
              <div key={ex._id} className="sd-exam-card">
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:15}}>
                  <span style={{background:'#f1f5f9', padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:700}}>ID: {ex._id.slice(-5)}</span>
                </div>
                <h3 style={{fontSize:18, fontWeight:700, marginBottom:8}}>{ex.title}</h3>
                <p style={{fontSize:13, color:'var(--text-muted)', marginBottom:20}}>{ex.description || "Évaluation de module."}</p>
                
                <div style={{display:'flex', gap:15, fontSize:12, color:'var(--text-muted)', fontWeight:600}}>
                  <span>⏱ {ex.durationMinutes} min</span>
                  <span>✍️ {ex.maxAttempts} essai</span>
                </div>

                <Link to={`/student/exams/${ex._id}`} className="sd-btn-pass">
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}