import React, { useEffect, useState } from "react";
import AdminShell from "components/Admin/AdminShell";
import { getAdminExams, approveAdminExam, rejectAdminExam, deleteAdminExam } from "api/admin";

export default function ExamsAdmin() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminExams();
      setExams(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onApprove = async (id) => {
    try {
      await approveAdminExam(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const onReject = async (id) => {
    try {
      await rejectAdminExam(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Supprimer cet examen et toutes les soumissions associées ?")) return;
    try {
      await deleteAdminExam(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <AdminShell
      title="Supervision des examens"
      subtitle="Approuvez les examens publiés par les enseignants, rejetez ou supprimez n’importe quel examen."
    >
      {error && <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
      ) : (
        <div className="ad-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Auteur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => {
                  const needsApproval = ex.published && ex.adminApproved === false;
                  return (
                    <tr key={ex._id}>
                      <td style={{ fontWeight: 600 }}>{ex.title}</td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {ex.createdBy?.name || ex.createdBy?.email || "—"}
                      </td>
                      <td>
                        {!ex.published && <span className="ad-badge ad-badge-muted">Brouillon</span>}
                        {ex.published && ex.adminApproved && <span className="ad-badge ad-badge-success">Visible étudiants</span>}
                        {needsApproval && <span className="ad-badge ad-badge-warn">En attente approbation</span>}
                        {ex.published && ex.adminApproved === false && !needsApproval && (
                          <span className="ad-badge ad-badge-warn">Non approuvé</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {needsApproval && (
                            <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => onApprove(ex._id)}>
                              Approuver
                            </button>
                          )}
                          {ex.published && (
                            <button type="button" className="ad-btn ad-btn-muted ad-btn-sm" onClick={() => onReject(ex._id)}>
                              Rejeter
                            </button>
                          )}
                          <button type="button" className="ad-btn ad-btn-danger ad-btn-sm" onClick={() => onDelete(ex._id)}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
