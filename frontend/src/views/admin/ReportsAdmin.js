import React, { useEffect, useState } from "react";
import AdminShell from "components/Admin/AdminShell";
import { getAdminReportsSummary } from "api/admin";

export default function ReportsAdmin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await getAdminReportsSummary();
        setData(d);
      } catch (e) {
        setError(e.message || "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const agg = data?.aggregates || {};

  return (
    <AdminShell
      title="Rapports globaux"
      subtitle="Tous les examens, scores agrégés et activité des soumissions."
    >
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {loading && <p style={{ color: "var(--text-muted)" }}>Chargement…</p>}

      {!loading && data && (
        <>
          <div className="ad-stats-row">
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Soumissions (échantillon)</p>
              <p className="ad-stat-val">{data.recentSubmissions?.length ?? 0}</p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Score moyen</p>
              <p className="ad-stat-val" style={{ color: "var(--primary)" }}>
                {agg.avgScore != null ? Number(agg.avgScore).toFixed(2) : "0"}
              </p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total points max (moy.)</p>
              <p className="ad-stat-val">{agg.avgMax != null ? Number(agg.avgMax).toFixed(2) : "0"}</p>
            </div>
            <div className="ad-stat-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Examens (liste)</p>
              <p className="ad-stat-val">{data.examsOverview?.length ?? 0}</p>
            </div>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 16 }}>Activité par jour (14 jours)</h2>
          <div className="ad-card">
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Soumissions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.activityByDay || []).map((row) => (
                    <tr key={row._id}>
                      <td>{row._id}</td>
                      <td>{row.submissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 16 }}>Vue des examens</h2>
          <div className="ad-card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Publié</th>
                    <th>Approuvé admin</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.examsOverview || []).map((ex) => (
                    <tr key={ex._id}>
                      <td>{ex.title}</td>
                      <td>{ex.published ? "Oui" : "Non"}</td>
                      <td>{ex.adminApproved !== false ? "Oui" : "Non"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 16 }}>Dernières soumissions (200)</h2>
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
                  {(data.recentSubmissions || []).map((s) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
