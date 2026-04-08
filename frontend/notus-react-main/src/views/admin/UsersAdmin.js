import React, { useEffect, useMemo, useState } from "react";
import AdminShell from "components/Admin/AdminShell";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from "api/admin";

const ROLES = [
  { value: "student", label: "Étudiant" },
  { value: "professor", label: "Enseignant" },
  { value: "admin", label: "Administrateur" },
];

const ENROLL = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "Actif" },
  { value: "suspended", label: "Suspendu" },
];

export default function UsersAdmin({ enrollmentOnly = false }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    enrollmentStatus: "active",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params = enrollmentOnly ? { role: "student", enrollmentStatus: "pending" } : {};
      const data = await getAdminUsers(params);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentOnly]);

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return users.filter((u) => (u.name || "").toLowerCase().includes(t) || (u.email || "").toLowerCase().includes(t));
  }, [users, search]);

  const openCreate = () => {
    setForm({ name: "", email: "", password: "", role: "student", enrollmentStatus: "active" });
    setModal("create");
  };

  const openEdit = (u) => {
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role,
      enrollmentStatus: u.enrollmentStatus || "active",
      _id: u._id,
    });
    setModal("edit");
  };

  const saveCreate = async (e) => {
    e.preventDefault();
    try {
      await createAdminUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        enrollmentStatus: form.enrollmentStatus,
      });
      setModal(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        enrollmentStatus: form.enrollmentStatus,
      };
      if (form.password && form.password.trim()) payload.password = form.password;
      await updateAdminUser(form._id, payload);
      setModal(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const onDelete = async (u) => {
    if (!window.confirm(`Supprimer définitivement ${u.email} ?`)) return;
    try {
      await deleteAdminUser(u._id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const quickEnroll = async (u, status) => {
    try {
      await updateAdminUser(u._id, { enrollmentStatus: status });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AdminShell
      title={enrollmentOnly ? "Contrôle des inscriptions" : "Gestion des utilisateurs"}
      subtitle={
        enrollmentOnly
          ? "Validez ou refusez les comptes étudiants en attente."
          : "Créez, modifiez, supprimez des comptes et attribuez les rôles."
      }
    >
      {error && (
        <p style={{ color: "#dc2626", marginBottom: 12 }} role="alert">
          {error}
        </p>
      )}

      <div className="ad-topbar" style={{ marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <input
            className="ad-input"
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 16 }}
          />
        </div>
        {!enrollmentOnly && (
          <button type="button" className="ad-btn ad-btn-primary" onClick={openCreate}>
            + Nouvel utilisateur
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Chargement…</p>
      ) : (
        <div className="ad-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name || "—"}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="ad-badge ad-badge-muted">{u.role}</span>
                    </td>
                    <td>
                      {u.role === "student" ? (
                        <span
                          className={
                            u.enrollmentStatus === "active"
                              ? "ad-badge ad-badge-success"
                              : u.enrollmentStatus === "pending"
                                ? "ad-badge ad-badge-warn"
                                : "ad-badge ad-badge-danger"
                          }
                        >
                          {u.enrollmentStatus || "active"}
                        </span>
                      ) : (
                        <span className="ad-badge ad-badge-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {enrollmentOnly && u.role === "student" && u.enrollmentStatus === "pending" && (
                          <>
                            <button type="button" className="ad-btn ad-btn-primary ad-btn-sm" onClick={() => quickEnroll(u, "active")}>
                              Approuver
                            </button>
                            <button type="button" className="ad-btn ad-btn-muted ad-btn-sm" onClick={() => quickEnroll(u, "suspended")}>
                              Refuser
                            </button>
                          </>
                        )}
                        {!enrollmentOnly && (
                          <>
                            <button type="button" className="ad-btn ad-btn-muted ad-btn-sm" onClick={() => openEdit(u)}>
                              Modifier
                            </button>
                            <button type="button" className="ad-btn ad-btn-danger ad-btn-sm" onClick={() => onDelete(u)}>
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal === "create" && (
        <div className="ad-modal-overlay" role="dialog">
          <div className="ad-modal">
            <h2 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>Nouvel utilisateur</h2>
            <form onSubmit={saveCreate}>
              <label className="ad-label">Nom</label>
              <input className="ad-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="ad-label">Email</label>
              <input className="ad-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="ad-label">Mot de passe</label>
              <input className="ad-input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="ad-label">Rôle</label>
              <select className="ad-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ marginBottom: 12 }}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <label className="ad-label">Statut d&apos;inscription</label>
              <select className="ad-select" value={form.enrollmentStatus} onChange={(e) => setForm({ ...form, enrollmentStatus: e.target.value })} style={{ marginBottom: 16 }}>
                {ENROLL.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="ad-btn ad-btn-muted" onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="submit" className="ad-btn ad-btn-primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "edit" && (
        <div className="ad-modal-overlay" role="dialog">
          <div className="ad-modal">
            <h2 style={{ fontFamily: "var(--font-display)", marginTop: 0 }}>Modifier l&apos;utilisateur</h2>
            <form onSubmit={saveEdit}>
              <label className="ad-label">Nom</label>
              <input className="ad-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="ad-label">Email</label>
              <input className="ad-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="ad-label">Nouveau mot de passe (optionnel)</label>
              <input className="ad-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ marginBottom: 12 }} />
              <label className="ad-label">Rôle</label>
              <select className="ad-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ marginBottom: 12 }}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <label className="ad-label">Inscription (étudiants)</label>
              <select className="ad-select" value={form.enrollmentStatus} onChange={(e) => setForm({ ...form, enrollmentStatus: e.target.value })} style={{ marginBottom: 16 }}>
                {ENROLL.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="ad-btn ad-btn-muted" onClick={() => setModal(null)}>
                  Annuler
                </button>
                <button type="submit" className="ad-btn ad-btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
