import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedExams, getMySubmissions } from "../../api/student";
import { getStoredAuth } from "../../api/auth";
import { getMyAnnouncements } from "../../api/announcements";
import StudentShell from "../../components/StudentShell";

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [announcements, setAnnouncements] = useState([]);

  const authUser = getStoredAuth()?.user || {};
  const displayName = authUser.name || authUser.email || "Étudiant";

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const loadDashboard = async ({ pageArg = page, qArg = searchTerm, statusArg = statusFilter } = {}) => {
    try {
      setLoading(true);
      setError("");

      const [examsRes, subsRes, ann] = await Promise.all([
        getPublishedExams({
          page: pageArg,
          limit,
          q: qArg || "",
          status: statusArg || "all",
          sort: "startAt",
          order: "asc",
        }),
        getMySubmissions({
          page: 1,
          limit: 50,
          status: "all",
          sort: "createdAt",
          order: "desc",
        }),
        getMyAnnouncements().catch(() => []),
      ]);

      const examsList = Array.isArray(examsRes?.data) ? examsRes.data : Array.isArray(examsRes) ? examsRes : [];
      const subsList = Array.isArray(subsRes?.data) ? subsRes.data : Array.isArray(subsRes) ? subsRes : [];

      setExams(examsList);
      setSubs(subsList);
      setAnnouncements(Array.isArray(ann) ? ann : []);
      setTotalPages(Math.max(1, examsRes?.pagination?.totalPages || 1));
    } catch (e) {
      setError(e.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard({ pageArg: 1, qArg: "", statusArg: "all" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadDashboard({ pageArg: 1, qArg: searchTerm, statusArg: statusFilter });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadDashboard({ pageArg: page, qArg: searchTerm, statusArg: statusFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filteredExams = useMemo(() => exams, [exams]);

  const stats = useMemo(() => {
    const totalSubmissions = subs.filter((s) => s.status !== "in_progress").length;
    const graded = subs.filter((s) => typeof s.score === "number" && typeof s.maxScore === "number" && s.maxScore > 0);
    const avg = graded.length
      ? (graded.reduce((acc, s) => acc + (s.score / s.maxScore) * 20, 0) / graded.length).toFixed(1)
      : "0.0";

    return { totalAvailable: exams.length, totalSubmissions, avg };
  }, [exams, subs]);

  const searchSlot = (
    <div className="sd-search-wrapper">
      <span className="sd-search-icon">🔎</span>
      <input
        type="text"
        className="sd-search-input"
        placeholder="Rechercher un examen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );

  const rightSlot = (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      style={{ background: "white", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: "12px" }}
    >
      <option value="all">Tous</option>
      <option value="open">Ouverts</option>
      <option value="upcoming">À venir</option>
      <option value="closed">Fermés</option>
    </select>
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
          --secondary: #0ea5e9;
          --success: #10b981;
          --text-main: #1e293b;
          --text-muted: #64748b;
          --border: #e2e8f0;
          --font-display: 'Syne', sans-serif;
          --font-body: 'DM Sans', sans-serif;
        }

        .sd-layout { display: flex; min-height: 100vh; background: var(--bg); font-family: var(--font-body); }
        .sd-sidebar { width: var(--sidebar-width); background: white; border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; height: 100vh; z-index: 10; }
        .sd-logo { padding: 30px; font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 10px; }
        .sd-nav { flex: 1; padding: 10px 20px; }
        .sd-nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 12px; color: var(--text-muted); text-decoration: none; font-weight: 600; transition: 0.2s; margin-bottom: 5px; }
        .sd-nav-link:hover, .sd-nav-link.active { background: #eef2ff; color: var(--primary); }
        .sd-profile-zone { padding: 20px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .sd-avatar { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }

        .sd-main { flex: 1; margin-left: var(--sidebar-width); padding: 30px 40px; }
        .sd-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 20px; }
        .sd-search-wrapper { position: relative; flex: 1; max-width: 500px; }
        .sd-search-input { width: 100%; padding: 12px 20px 12px 45px; border-radius: 15px; border: 1px solid var(--border); background: white; outline: none; transition: 0.2s; }
        .sd-search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .sd-search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

        .sd-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .sd-stat-card { background: white; padding: 25px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid var(--border); }
        .sd-stat-val { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--text-main); }

        .sd-exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .sd-exam-card { background: white; border-radius: 24px; padding: 25px; border: 1px solid var(--border); transition: 0.3s; }
        .sd-exam-card:hover { transform: translateY(-5px); border-color: var(--primary); }

        .sd-btn-pass { display: block; width: 100%; text-align: center; padding: 12px; background: var(--primary); color: white; border-radius: 12px; font-weight: 700; text-decoration: none; margin-top: 20px; }

        .sd-skeleton { border-radius: 24px; background: #e2e8f0; animation: pulse 1.2s infinite; }
        @keyframes pulse { 0% {opacity: 0.5} 50% {opacity: 1} 100% {opacity: 0.5} }
      `}</style>

      <StudentShell
        title={`Bienvenue, ${displayName.split(" ")[0] || "étudiant"} 👋`}
        subtitle="Voici ce qui se passe dans vos cours aujourd'hui."
        error={error}
        searchSlot={searchSlot}
        rightSlot={rightSlot}
      >
        {announcements.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 12 }}>Annonces</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {announcements.slice(0, 5).map((a) => (
                <div key={a._id} style={{ background: "white", borderRadius: 16, padding: 16, border: "1px solid var(--border)" }}>
                  <p style={{ fontWeight: 700, margin: "0 0 6px" }}>{a.title}</p>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", whiteSpace: "pre-wrap" }}>{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sd-stats-row">
          <div className="sd-stat-card">
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Examens visibles</p>
            <p className="sd-stat-val" style={{ color: "var(--secondary)" }}>{stats.totalAvailable}</p>
          </div>
          <div className="sd-stat-card">
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Passés</p>
            <p className="sd-stat-val" style={{ color: "var(--primary)" }}>{stats.totalSubmissions}</p>
          </div>
          <div className="sd-stat-card">
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Moyenne</p>
            <p className="sd-stat-val" style={{ color: "var(--success)" }}>{stats.avg}/20</p>
          </div>
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 20 }}>Examens disponibles</h2>
        <div className="sd-exam-grid">
          {loading
            ? [1, 2].map((i) => <div key={i} className="sd-skeleton" style={{ height: 250 }} />)
            : filteredExams.map((ex) => (
                <div key={ex._id} className="sd-exam-card">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                    <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                      ID: {ex._id.slice(-5)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{ex.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                    {ex.description || "Évaluation de module."}
                  </p>

                  <div style={{ display: "flex", gap: 15, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                    <span>⏱ {ex.durationMinutes} min</span>
                    <span>✍️ {ex.maxAttempts || 1} essai</span>
                    <span>📌 {ex.availabilityStatus || "open"}</span>
                  </div>

                  <Link to={`/student/exams/${ex._id}`} className="sd-btn-pass">
                    Passer l’examen
                  </Link>
                </div>
              ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "white" }}
          >
            Précédent
          </button>
          <span style={{ alignSelf: "center", color: "var(--text-muted)" }}>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "white" }}
          >
            Suivant
          </button>
        </div>
      </StudentShell>
    </>
  );
}