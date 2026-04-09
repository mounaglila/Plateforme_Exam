import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getStoredAuth } from "../api/auth";

export default function StudentShell({ children, title, subtitle, error, searchSlot, rightSlot }) {
  const location = useLocation();
  const authUser = getStoredAuth()?.user || {};
  const displayName = authUser.name || authUser.email || "Étudiant";

  const pathname = location.pathname;

const isDashboardActive = pathname === "/student" || pathname === "/student/dashboard";
const isExamsActive = pathname.startsWith("/student/exams"); // garde actif aussi sur /student/exams/:id
const isResultsActive = pathname.startsWith("/student/submissions");

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

        .sd-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
          font-family: var(--font-body);
        }

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
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sd-nav {
          flex: 1;
          padding: 10px 20px;
        }

        .sd-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          border-radius: 12px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          transition: 0.2s;
          margin-bottom: 5px;
        }

        .sd-nav-link:hover,
        .sd-nav-link.active {
          background: #eef2ff;
          color: var(--primary);
        }

        .sd-profile-zone {
          padding: 20px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sd-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .sd-main {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 30px 40px;
        }

        .sd-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .sd-search-wrapper {
          position: relative;
          flex: 1;
          min-width: 250px;
          max-width: 500px;
        }

        .sd-search-input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          border-radius: 15px;
          border: 1px solid var(--border);
          background: white;
          outline: none;
          transition: 0.2s;
        }

        .sd-search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .sd-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .sd-title {
          font-family: var(--font-display);
          font-size: 30px;
          line-height: 1.2;
          color: var(--text-main);
          margin: 0 0 8px;
        }

        .sd-subtitle {
          color: var(--text-muted);
          margin: 0;
        }

        .text-red-600 {
          color: #dc2626;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        @media (max-width: 900px) {
          .sd-sidebar {
            position: static;
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          .sd-layout {
            flex-direction: column;
          }

          .sd-main {
            margin-left: 0;
            padding: 20px;
          }

          .sd-logo {
            padding: 20px;
          }

          .sd-nav {
            padding: 0 16px 16px;
          }

          .sd-profile-zone {
            display: none;
          }
        }
      `}</style>

      <div className="sd-layout">
        <aside className="sd-sidebar">
          <div className="sd-logo">
            <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8 }} />
            EduSmart
          </div>

          <nav className="sd-nav">
            <Link to="/student/dashboard" className={`sd-nav-link ${isDashboardActive ? "active" : ""}`}>
              Tableau de bord
            </Link>
            <Link to="/student/exams" className={`sd-nav-link ${isExamsActive ? "active" : ""}`}>
              Mes Examens
            </Link>
            <Link to="/student/submissions" className={`sd-nav-link ${isResultsActive ? "active" : ""}`}>
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
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)", margin: 0 }}>{displayName}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Étudiant</p>
            </div>
          </div>
        </aside>

        <main className="sd-main">
          {error ? <p className="text-red-600 mb-4">{error}</p> : null}

          <div className="sd-topbar">
            <div className="sd-search-wrapper">{searchSlot || null}</div>
            <div>{rightSlot || null}</div>
          </div>

          {title ? <h1 className="sd-title">{title}</h1> : null}
          {subtitle ? (
            <p className="sd-subtitle" style={{ marginBottom: 30 }}>
              {subtitle}
            </p>
          ) : null}

          {children}
        </main>
      </div>
    </>
  );
}