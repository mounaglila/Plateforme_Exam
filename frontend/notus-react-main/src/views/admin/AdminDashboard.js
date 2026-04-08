import React, { useEffect, useState } from "react";
import AdminShell from "components/Admin/AdminShell";
import { getAdminDashboardStats } from "api/admin";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getAdminDashboardStats();
        setData(d);
      } catch (e) {
        setError(e.message || "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byRole = data?.users?.byRole || {};

  return (
    <AdminShell
      title="Tableau de bord administrateur"
      subtitle="Vue d’ensemble de la plateforme, inscriptions et activité récente."
    >
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {loading && <p style={{ color: "var(--text-muted)" }}>Chargement…</p>}

      {!loading && data && (
        <>
          <div className="ad-stats-row">
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Utilisateurs</p>
              <p className="ad-stat-val" style={{ color: "var(--primary)" }}>
                {data.users.total}
              </p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Étudiants en attente</p>
              <p className="ad-stat-val" style={{ color: "var(--warning)" }}>
                {data.users.pendingStudentEnrollments}
              </p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Examens</p>
              <p className="ad-stat-val">{data.exams.total}</p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>À approuver</p>
              <p className="ad-stat-val" style={{ color: "var(--secondary)" }}>
                {data.exams.pendingAdminApproval}
              </p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Soumissions</p>
              <p className="ad-stat-val" style={{ color: "var(--success)" }}>
                {data.submissions.total}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
            <div className="ad-card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 12 }}>Rôles</h3>
              <p style={{ margin: "6px 0" }}>
                <span className="ad-badge ad-badge-muted">Étudiants</span> {byRole.student ?? 0}
              </p>
              <p style={{ margin: "6px 0" }}>
                <span className="ad-badge ad-badge-muted">Enseignants</span> {byRole.professor ?? 0}
              </p>
              <p style={{ margin: "6px 0" }}>
                <span className="ad-badge ad-badge-muted">Admins</span> {byRole.admin ?? 0}
              </p>
            </div>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 16 }}>Activité récente (soumissions)</h2>
          <div className="ad-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Examen</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentSubmissions || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: "var(--text-muted)" }}>
                        Aucune soumission récente
                      </td>
                    </tr>
                  ) : (
                    data.recentSubmissions.map((s) => (
                      <tr key={s._id}>
                        <td>{s.student?.name || s.student?.email || "—"}</td>
                        <td>{s.exam?.title || "—"}</td>
                        <td>
                          {s.score}/{s.maxScore}
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                          {s.createdAt ? new Date(s.createdAt).toLocaleString("fr-FR") : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
