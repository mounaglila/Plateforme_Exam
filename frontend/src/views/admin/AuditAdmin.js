import React, { useEffect, useState } from "react";
import AdminShell from "components/Admin/AdminShell";
import { getAdminAuditLogs } from "api/admin";

export default function AuditAdmin() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAdminAuditLogs(300);
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminShell
      title="Journal d&apos;audit"
      subtitle="Connexions, inscriptions, actions administrateur, examens et soumissions."
    >
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
      ) : (
        <div className="ad-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Acteur</th>
                  <th>Entité</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleString("fr-FR") : "—"}
                    </td>
                    <td>
                      <span className="ad-badge ad-badge-muted">{log.action}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {log.actor?.email || log.actorEmail || "—"}
                      {log.actor?.role && <span style={{ color: "var(--text-muted)" }}> ({log.actor.role})</span>}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {log.entityType}
                      {log.entityId && <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{log.entityId}</div>}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 280 }}>
                      {log.meta && Object.keys(log.meta).length ? JSON.stringify(log.meta) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
