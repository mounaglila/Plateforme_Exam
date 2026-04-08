import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { getStoredAuth } from "../../api/auth";

const shellStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --sidebar-width: 260px;
          --bg: #f8fafc;
          --surface: #ffffff;
          --primary: #6366f1;
          --secondary: #0ea5e9;
          --success: #10b981;
          --warning: #f59e0b;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .ad-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }

        .ad-sidebar {
          width: var(--sidebar-width);
          background: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 10;
        }

        .ad-logo {
          padding: 30px;
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          display: flex; align-items: center; gap: 10px;
        }

        .ad-nav { flex: 1; padding: 10px 20px; overflow-y: auto; }
        .ad-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 15px; border-radius: 12px;
          color: var(--text-muted); text-decoration: none;
          font-weight: 600; transition: 0.2s; margin-bottom: 5px;
        }
        .ad-nav-link:hover, .ad-nav-link.active {
          background: #eef2ff; color: var(--primary);
        }

        .ad-profile-zone {
          padding: 20px; border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 12px;
        }
        .ad-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
          font-size: 13px;
        }

        .ad-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; min-height: 100vh; }

        .ad-topbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 32px; gap: 20px; flex-wrap: wrap;
        }

        .ad-card {
          background: white; border-radius: 24px; padding: 25px; border: 1px solid var(--border);
          margin-bottom: 20px;
        }

        .ad-btn {
          padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 13px;
          border: none; cursor: pointer; transition: 0.2s;
        }
        .ad-btn-primary { background: var(--primary); color: white; }
        .ad-btn-primary:hover { opacity: 0.92; }
        .ad-btn-danger { background: #ef4444; color: white; }
        .ad-btn-muted { background: #f1f5f9; color: var(--text-main); }
        .ad-btn-sm { padding: 6px 12px; font-size: 12px; }

        .ad-table-wrap { overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .ad-table th, .ad-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border); }
        .ad-table th { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }

        .ad-input, .ad-select, .ad-textarea {
          width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--border);
          font-family: var(--font-body); font-size: 14px;
        }
        .ad-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; }

        .ad-badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
        .ad-badge-success { background: #ecfdf5; color: var(--success); }
        .ad-badge-warn { background: #fffbeb; color: var(--warning); }
        .ad-badge-muted { background: #f1f5f9; color: var(--text-muted); }
        .ad-badge-danger { background: #fef2f2; color: #dc2626; }

        .ad-stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .ad-stat-card {
          background: white; padding: 25px; border-radius: 24px; border: 1px solid var(--border);
        }
        .ad-stat-val { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-main); }

        .ad-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.45); z-index: 100;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .ad-modal {
          background: white; border-radius: 24px; padding: 28px; max-width: 480px; width: 100%;
          max-height: 90vh; overflow-y: auto; border: 1px solid var(--border);
        }
`;

function initials(name, email) {
  if (name && name.trim()) {
    const p = name.trim().split(/\s+/);
    return ((p[0][0] || "") + (p[1]?.[0] || "")).toUpperCase().slice(0, 2);
  }
  return (email || "A").slice(0, 2).toUpperCase();
}

export default function AdminShell({ children, title, subtitle }) {
  const history = useHistory();
  const auth = getStoredAuth();
  const user = auth.user || {};
  const displayName = user.name || user.email || "Admin";

  const logout = () => {
    localStorage.removeItem("auth");
    history.push("/auth/login");
  };

  return (
    <>
      <style>{shellStyles}</style>
      <div className="ad-layout">
        <aside className="ad-sidebar">
          <div className="ad-logo">
            <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8 }} />
            EduSmart
          </div>

          <nav className="ad-nav">
            <NavLink exact className="ad-nav-link" activeClassName="active" to="/admin/dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Tableau de bord
            </NavLink>
            <NavLink className="ad-nav-link" activeClassName="active" to="/admin/users">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Utilisateurs
            </NavLink>
            <NavLink className="ad-nav-link" activeClassName="active" to="/admin/enrollment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Inscriptions
            </NavLink>
            <NavLink className="ad-nav-link" activeClassName="active" to="/admin/reports">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Rapports
            </NavLink>
            <NavLink className="ad-nav-link" activeClassName="active" to="/admin/exams">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Examens
            </NavLink>
            <NavLink className="ad-nav-link" activeClassName="active" to="/admin/audit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Journal d&apos;audit
            </NavLink>
            <NavLink className="ad-nav-link" activeClassName="active" to="/admin/announcements">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Annonces
            </NavLink>
          </nav>

          <div className="ad-profile-zone">
            <div className="ad-avatar">{initials(user.name, user.email)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)", margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Administrateur</p>
            </div>
            <button type="button" className="ad-btn ad-btn-muted ad-btn-sm" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="ad-main">
          <div className="ad-topbar">
            <div>
              {title && (
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--text-main)", margin: "0 0 6px" }}>
                  {title}
                </h1>
              )}
              {subtitle && <p style={{ color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>}
            </div>
          </div>
          {children}
        </main>
      </div>
    </>
  );
}
