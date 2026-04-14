import React, { useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { getMyProfessorExams, publishProfessorExam } from "../../api/professor";
import { getStoredAuth } from "../../api/auth";
import { getMyAnnouncements } from "../../api/announcements";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export default function ProfessorDashboard() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [announcements, setAnnouncements] = useState([]);
const [displayName, setDisplayName] = useState("Enseignant");

useEffect(() => {
  const auth = getStoredAuth();
  if (auth && auth.user) {
    setDisplayName(auth.user.name || auth.user.email);
  }
}, []);
  const history = useHistory();

  const logout = () => {
    localStorage.removeItem("auth");
    history.push("/auth/login");
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
    (async () => {
      try {
        const ann = await getMyAnnouncements();
        setAnnouncements(Array.isArray(ann) ? ann : []);
      } catch {
        setAnnouncements([]);
      }
    })();
  }, []);
  useEffect(() => {
  const auth = getStoredAuth();

  if (auth && auth.user) {
    setDisplayName(auth.user.name || auth.user.email);
  }
}, []);

  const filteredExams = useMemo(() => {
    return exams.filter(ex => ex.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [exams, searchTerm]);

  const stats = useMemo(() => {
    const total = exams.length;
    const published = exams.filter((e) => e.published).length;
    const pendingAdmin = exams.filter((e) => e.published && e.adminApproved === false).length;
    return { total, published, drafts: total - published, pendingAdmin };
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

        :root {
          --sidebar-width: 260px;
          --bg: #f8fafc;
          --surface: #ffffff;
          --primary: #6366f1;
          --primary-light: #eef2ff;
          --primary-dim: rgba(99,102,241,0.08);
          --success: #10b981;
          --success-bg: #ecfdf5;
          --warning: #f59e0b;
          --warning-bg: #fffbeb;
          --danger: #ef4444;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --text-light: #94a3b8;
          --border: #e2e8f0;
          --border-focus: #a5b4fc;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 24px;
          --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
          --shadow-lg: 0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.05);
          --shadow-primary: 0 8px 20px rgba(99,102,241,0.25);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pd-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); color: var(--text-main); -webkit-font-smoothing: antialiased; }

        /* SIDEBAR */
        .pd-sidebar { width: var(--sidebar-width); background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 10; }

        .pd-logo { padding: 26px 22px 22px; font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
        .pd-logo-mark { width: 34px; height: 34px; background: linear-gradient(135deg, var(--primary) 0%, #818cf8 100%); border-radius: 9px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(99,102,241,0.3); flex-shrink: 0; }

        .pd-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
        .pd-nav-label { font-size: 10px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px 6px; }
        .pd-nav-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); color: var(--text-main);text-decoration: none; font-size: 14px; font-weight: 600; transition: all 0.15s ease; }
        .pd-nav-link:hover { background: var(--bg); color: var(--text-main); }
        .pd-nav-link.active { background: var(--primary-light); color: var(--primary); }
        .pd-nav-link-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: transparent; transition: background 0.15s; flex-shrink: 0; }
        .pd-nav-link:hover .pd-nav-link-icon { background: var(--border); }
        .pd-nav-link.active .pd-nav-link-icon { background: var(--primary-dim); color: var(--primary); }

        /* PROFILE ZONE */
        .pd-profile-zone { padding: 14px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; background: var(--bg); }
        .pd-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; flex-shrink: 0; }
        .pd-profile-info { flex: 1; min-width: 0; }
        .pd-profile-name { font-size: 13px; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pd-profile-role { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

        /* LOGOUT BUTTON */
        .pd-logout-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .pd-logout-btn:hover {
          background: #fef2f2;
          border-color: #fecaca;
          color: var(--danger);
        }

        /* MAIN */
        .pd-main { flex: 1; margin-left: var(--sidebar-width); padding: 32px 40px; }

        .pd-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; gap: 16px; }
        .pd-search-wrapper { position: relative; flex: 1; max-width: 380px; }
        .pd-search-input { width: 100%; padding: 10px 16px 10px 42px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--surface); font-family: var(--font-body); font-size: 14px; color: var(--text-main); outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-shadow: var(--shadow-xs); }
        .pd-search-input::placeholder { color: var(--text-light); }
        .pd-search-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .pd-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--text-light); pointer-events: none; }
        .pd-create-btn { background: var(--primary); color: white; padding: 10px 20px; border-radius: var(--radius-sm); font-family: var(--font-body); font-weight: 700; font-size: 14px; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease; box-shadow: var(--shadow-primary); white-space: nowrap; }
        .pd-create-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(99,102,241,0.35); }

        .pd-page-header { margin-bottom: 32px; }
        .pd-greeting { font-size: 13px; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
        .pd-page-title { font-family: var(--font-display); font-size: 30px; font-weight: 800; color: var(--text-main); line-height: 1.15; letter-spacing: -0.5px; }
        .pd-page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 5px; }

        .pd-stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 36px; }
        .pd-stat-card { background: var(--surface); padding: 20px 22px 18px; border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: var(--shadow-sm); position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
        .pd-stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .pd-stat-card-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .pd-stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .pd-stat-val { font-family: var(--font-display); font-size: 36px; font-weight: 800; line-height: 1; letter-spacing: -1px; }

        .pd-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .pd-section-title { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text-main); }
        .pd-count-pill { background: var(--bg); border: 1px solid var(--border); color: var(--text-muted); font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }

        .pd-ann-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 36px; }
        .pd-ann-card { background: var(--surface); border-radius: var(--radius-md); padding: 16px 18px; border: 1px solid var(--border); border-left: 3px solid var(--primary); box-shadow: var(--shadow-xs); transition: box-shadow 0.2s; }
        .pd-ann-card:hover { box-shadow: var(--shadow-sm); }
        .pd-ann-title { font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 5px; }
        .pd-ann-body { font-size: 13px; color: var(--text-muted); white-space: pre-wrap; line-height: 1.55; }

        .pd-exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
        .pd-card { background: var(--surface); border-radius: var(--radius-lg); padding: 22px; border: 1px solid var(--border); display: flex; flex-direction: column; box-shadow: var(--shadow-sm); transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s; }
        .pd-card:hover { border-color: #c7d2fe; transform: translateY(-3px); box-shadow: var(--shadow-lg); }

        .pd-badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
        .pd-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
        .pd-badge--pub { background: var(--success-bg); color: var(--success); }
        .pd-badge--draft { background: var(--warning-bg); color: var(--warning); }
        .pd-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        .pd-card-title { font-size: 17px; font-weight: 700; line-height: 1.3; color: var(--text-main); margin-bottom: 8px; letter-spacing: -0.2px; }
        .pd-card-desc { font-size: 13px; color: var(--text-muted); flex-grow: 1; margin-bottom: 18px; line-height: 1.6; }
        .pd-card-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }
        .pd-meta-item { background: var(--bg); border-radius: var(--radius-sm); padding: 10px 12px; border: 1px solid var(--border); }
        .pd-meta-label { font-size: 10px; color: var(--text-light); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 3px; }
        .pd-meta-val { font-size: 13px; font-weight: 700; color: var(--text-main); }

        .pd-actions { display: flex; gap: 8px; padding-top: 16px; border-top: 1px solid var(--border); }
        .pd-btn { flex: 1; padding: 9px 14px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 13px; font-weight: 700; text-align: center; text-decoration: none; border: 1.5px solid transparent; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .pd-btn--edit { background: var(--bg); color: var(--text-main); border-color: var(--border); }
        .pd-btn--edit:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .pd-btn--pub { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 3px 8px rgba(99,102,241,0.3); }
        .pd-btn--pub:hover:not(:disabled) { background: #4f46e5; box-shadow: 0 6px 16px rgba(99,102,241,0.4); transform: translateY(-1px); }
        .pd-btn--pub:disabled { opacity: 0.55; cursor: not-allowed; }
        .pd-btn--icon { flex: 0 0 38px; background: var(--bg); border-color: var(--border); font-size: 15px; }
        .pd-btn--icon:hover { background: #f1f5f9; border-color: #cbd5e1; }

        .pd-skeleton { height: 280px; background: var(--surface); border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; position: relative; }
        .pd-skeleton::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, rgba(241,245,249,0.8) 40%, rgba(241,245,249,0.9) 50%, rgba(241,245,249,0.8) 60%, transparent 100%); animation: pd-sweep 1.5s ease-in-out infinite; }
        @keyframes pd-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .pd-error { background: #fef2f2; border: 1px solid #fecaca; border-left: 3px solid var(--danger); color: #b91c1c; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }

        @keyframes pd-spin { to { transform: rotate(360deg); } }
        .pd-spinner { animation: pd-spin 0.7s linear infinite; flex-shrink: 0; }
      `}</style>

      <div className="pd-layout">
        {/* SIDEBAR */}
        <aside className="pd-sidebar">
          <div className="pd-logo">
            <div className="pd-logo-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            EduSmart
          </div>

          <nav className="pd-nav">
            <div className="pd-nav-label">Menu</div>
            <Link to="/professor" className="pd-nav-link active">
              <span className="pd-nav-link-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              </span>
              Tableau de bord
            </Link>
            <Link to="/professor/exams-list" className="pd-nav-link">
              <span className="pd-nav-link-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </span>
              Mes Examens
            </Link>
          </nav>

          {/* PROFILE + LOGOUT */}
          <div className="pd-profile-zone">
            <div className="pd-avatar">
              {(displayName || "P")
                .split(/\s+/)
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="pd-profile-info">
              <p className="pd-profile-name">{displayName}</p>
              <p className="pd-profile-role">Enseignant</p>
            </div>
            <button className="pd-logout-btn" onClick={logout} title="Se déconnecter">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="pd-main">

          {error && (
            <div className="pd-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* TOPBAR */}
          <div className="pd-topbar">
            <div className="pd-search-wrapper">
              <span className="pd-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Créer un examen
            </Link>
          </div>

          {/* PAGE HEADER */}
          <div className="pd-page-header">
            <p className="pd-greeting">Bonjour, {displayName} 👋</p>
          
            <p className="pd-page-subtitle">Gérez vos évaluations et suivez la progression de vos étudiants.</p>
          </div>

          {/* ANNOUNCEMENTS */}
          {announcements.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <div className="pd-section-header">
                <h2 className="pd-section-title">Annonces</h2>
                <span style={{ background:"var(--primary-light)", color:"var(--primary)", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>
                  {announcements.length}
                </span>
              </div>
              <div className="pd-ann-list">
                {announcements.slice(0, 5).map((a) => (
                  <div key={a._id} className="pd-ann-card">
                    <p className="pd-ann-title">{a.title}</p>
                    <p className="pd-ann-body">{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATS */}
          <div className="pd-stats-row">
            <div className="pd-stat-card">
              <div className="pd-stat-card-stripe" style={{ background: "var(--text-main)" }} />
              <p className="pd-stat-label">Total Examens</p>
              <p className="pd-stat-val" style={{ color: "var(--text-main)" }}>{stats.total}</p>
            </div>
            <div className="pd-stat-card">
              <div className="pd-stat-card-stripe" style={{ background: "var(--success)" }} />
              <p className="pd-stat-label">Publiés</p>
              <p className="pd-stat-val" style={{ color: "var(--success)" }}>{stats.published}</p>
            </div>
            <div className="pd-stat-card">
              <div className="pd-stat-card-stripe" style={{ background: "var(--warning)" }} />
              <p className="pd-stat-label">Brouillons</p>
              <p className="pd-stat-val" style={{ color: "var(--warning)" }}>{stats.drafts}</p>
            </div>
            <div className="pd-stat-card">
              <div className="pd-stat-card-stripe" style={{ background: "var(--primary)" }} />
              <p className="pd-stat-label">Attente admin</p>
              <p className="pd-stat-val" style={{ color: "var(--primary)" }}>{stats.pendingAdmin}</p>
            </div>
          </div>

          {/* EXAM GRID */}
          <div className="pd-section-header" style={{ marginBottom: 16 }}>
            <h2 className="pd-section-title">Mes sessions d'examens</h2>
            {!loading && <span className="pd-count-pill">{filteredExams.length}</span>}
          </div>

          <div className="pd-exam-grid">
            {loading
              ? [1, 2].map((i) => <div key={i} className="pd-skeleton" />)
              : filteredExams.map((ex) => (
                  <div key={ex._id} className="pd-card">
                    <div className="pd-badge-row">
                      <span className={`pd-badge ${ex.published ? "pd-badge--pub" : "pd-badge--draft"}`}>
                        <span className="pd-badge-dot" />
                        {ex.published ? "Publié" : "Brouillon"}
                      </span>
                      {ex.published && ex.adminApproved === false && (
                        <span className="pd-badge pd-badge--draft">
                          <span className="pd-badge-dot" />
                          En attente validation admin
                        </span>
                      )}
                    </div>

                    <h3 className="pd-card-title">{ex.title}</h3>
                    <p className="pd-card-desc">{ex.description || "Aucune description fournie."}</p>

                    <div className="pd-card-meta">
                      <div className="pd-meta-item">
                        <p className="pd-meta-label">Durée</p>
                        <p className="pd-meta-val">{ex.durationMinutes} min</p>
                      </div>
                      <div className="pd-meta-item">
                        <p className="pd-meta-label">Début</p>
                        <p className="pd-meta-val">{fmt(ex.startAt)}</p>
                      </div>
                    </div>

                    <div className="pd-actions">
                      <Link to={`/professor/exams/${ex._id}`} className="pd-btn pd-btn--edit">
                        Modifier
                      </Link>
                      {!ex.published && (
                        <button
                          onClick={() => onPublish(ex._id)}
                          disabled={publishingId === ex._id}
                          className="pd-btn pd-btn--pub"
                        >
                          {publishingId === ex._id ? (
                            <>
                              <svg className="pd-spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
                              Publication…
                            </>
                          ) : "Publier"}
                        </button>
                      )}
                      <Link to={`/professor/exams/${ex._id}/submissions`} className="pd-btn pd-btn--icon">
                        📊
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </main>
      </div>
    </>
  );
}