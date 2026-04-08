import React, { useEffect, useState } from "react";
import AdminShell from "components/Admin/AdminShell";
import { getAdminAnnouncements, createAdminAnnouncement, deleteAdminAnnouncement } from "api/admin";

export default function AnnouncementsAdmin() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminAnnouncements();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await createAdminAnnouncement({ title, body, audience });
      setTitle("");
      setBody("");
      setAudience("all");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try {
      await deleteAdminAnnouncement(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminShell
      title="Annonces"
      subtitle="Diffusez un message à tous les utilisateurs, aux étudiants ou aux enseignants."
    >
      {error && <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>}

      <div className="ad-card">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, marginTop: 0 }}>Nouvelle annonce</h2>
        <form onSubmit={submit}>
          <label className="ad-label">Titre</label>
          <input className="ad-input" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ marginBottom: 12 }} />
          <label className="ad-label">Message</label>
          <textarea className="ad-textarea" rows={4} value={body} onChange={(e) => setBody(e.target.value)} style={{ marginBottom: 12 }} />
          <label className="ad-label">Audience</label>
          <select className="ad-select" value={audience} onChange={(e) => setAudience(e.target.value)} style={{ marginBottom: 16, maxWidth: 320 }}>
            <option value="all">Tout le monde</option>
            <option value="students">Étudiants uniquement</option>
            <option value="professors">Enseignants uniquement</option>
          </select>
          <button type="submit" className="ad-btn ad-btn-primary">
            Publier
          </button>
        </form>
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginBottom: 16 }}>Annonces publiées</h2>
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {list.map((a) => (
            <div key={a._id} className="ad-card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{a.title}</h3>
                  <span className="ad-badge ad-badge-muted">{a.audience}</span>
                  <p style={{ margin: "12px 0 0", color: "var(--text-main)", whiteSpace: "pre-wrap" }}>{a.body}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                    {a.createdBy?.name || a.createdBy?.email || "Admin"} · {a.createdAt ? new Date(a.createdAt).toLocaleString("fr-FR") : ""}
                  </p>
                </div>
                <button type="button" className="ad-btn ad-btn-danger ad-btn-sm" onClick={() => onDelete(a._id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {list.length === 0 && <p style={{ color: "var(--text-muted)" }}>Aucune annonce pour le moment.</p>}
        </div>
      )}
    </AdminShell>
  );
}
