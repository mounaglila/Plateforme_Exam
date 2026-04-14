import React, { useEffect, useMemo, useState } from "react";
import { getMySubmissions } from "../../api/student";
import StudentShell from "../../components/StudentShell";

export default function MySubmissions() {
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("all"); // all | submitted | graded | in_progress
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const loadSubmissions = async (targetPage = page, targetStatus = status) => {
    try {
      setLoading(true);
      setError("");

      const res = await getMySubmissions({
        page: targetPage,
        limit,
        status: targetStatus,
        sort: "createdAt",
        order: "desc",
      });

      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSubs(list);
      setTotalPages(Math.max(1, res?.pagination?.totalPages || 1));
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des soumissions");
      setSubs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(page, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [page, totalPages]);

  const stats = useMemo(() => {
    const total = subs.length;
    const corrigees = subs.filter((s) => s.status === "graded").length;
    const soumises = subs.filter((s) => s.status === "submitted").length;

    const graded = subs.filter(
      (s) => typeof s.score === "number" && typeof s.maxScore === "number" && s.maxScore > 0
    );
    const moyenne20 =
      graded.length > 0
        ? (
            graded.reduce((acc, s) => acc + (s.score / s.maxScore) * 20, 0) / graded.length
          ).toFixed(1)
        : "0.0";

    return { total, corrigees, soumises, moyenne20 };
  }, [subs]);

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
  };

  const badgeStyle = (st) => {
    if (st === "graded") return { bg: "#dcfce7", color: "#166534", label: "Corrigée" };
    if (st === "submitted") return { bg: "#dbeafe", color: "#1e40af", label: "Soumise" };
    return { bg: "#fef9c3", color: "#854d0e", label: "En cours" };
  };

  const rightSlot = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <label style={{ fontWeight: 700, color: "#334155" }}>Statut :</label>
      <select
        value={status}
        onChange={(e) => {
          setPage(1);
          setStatus(e.target.value);
        }}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: 10,
          padding: "8px 10px",
          background: "white",
        }}
      >
        <option value="all">Tous</option>
        <option value="submitted">Soumises</option>
        <option value="graded">Corrigées</option>
        <option value="in_progress">En cours</option>
      </select>
    </div>
  );

  return (
    <StudentShell
      title="Mes soumissions"
      subtitle="Retrouvez toutes vos tentatives, vos scores et l’état de correction."
      error={error}
      rightSlot={rightSlot}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Stat title="Tentatives (page)" value={stats.total} color="#6366f1" />
        <Stat title="Soumises" value={stats.soumises} color="#2563eb" />
        <Stat title="Corrigées" value={stats.corrigees} color="#16a34a" />
        <Stat title="Moyenne /20" value={stats.moyenne20} color="#ea580c" />
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 12 }}>
          {[1, 2, 3].map((k) => (
            <div key={k} style={{ height: 120, borderRadius: 16, background: "#e2e8f0" }} />
          ))}
        </div>
      ) : subs.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px dashed #cbd5e1",
            borderRadius: 16,
            padding: 30,
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Aucune soumission trouvée pour ce filtre.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {subs.map((s) => {
            const b = badgeStyle(s.status);
            return (
              <div
                key={s._id}
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#0f172a" }}>{s.exam?.title || "Examen"}</h3>
                    <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
                      Tentative #{s.attemptNumber || 1}
                    </p>
                  </div>
                  <span
                    style={{
                      background: b.bg,
                      color: b.color,
                      borderRadius: 999,
                      padding: "6px 12px",
                      fontWeight: 700,
                      fontSize: 12,
                      alignSelf: "flex-start",
                    }}
                  >
                    {b.label}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  <Info label="Score" value={`${s.score ?? 0} / ${s.maxScore ?? 0}`} />
                  <Info label="Soumis le" value={formatDate(s.submittedAt || s.createdAt)} />
                  <Info label="Temps passé" value={`${Math.floor((s.timeSpentSec || 0) / 60)} min`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 10 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            border: "1px solid #cbd5e1",
            background: "white",
            borderRadius: 10,
            padding: "8px 12px",
            cursor: page <= 1 ? "not-allowed" : "pointer",
            opacity: page <= 1 ? 0.6 : 1,
          }}
        >
          Précédent
        </button>
        <span style={{ alignSelf: "center", color: "#64748b" }}>
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{
            border: "1px solid #cbd5e1",
            background: "white",
            borderRadius: 10,
            padding: "8px 12px",
            cursor: page >= totalPages ? "not-allowed" : "pointer",
            opacity: page >= totalPages ? 0.6 : 1,
          }}
        >
          Suivant
        </button>
      </div>
    </StudentShell>
  );
}

function Stat({ title, value, color }) {
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 14 }}>
      <div style={{ width: 44, height: 4, borderRadius: 6, background: color, marginBottom: 8 }} />
      <p style={{ margin: 0, fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{title}</p>
      <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
      <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 700 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: "#0f172a", fontWeight: 700 }}>{value}</p>
    </div>
  );
}