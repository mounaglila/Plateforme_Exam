import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedExams } from "../../api/student";
import StudentShell from "../../components/StudentShell";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all"); // all | open | upcoming | closed
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const loadExams = async (targetPage = page, targetQ = searchTerm, targetStatus = status) => {
    try {
      setLoading(true);
      setError("");

      const res = await getPublishedExams({
        page: targetPage,
        limit,
        q: targetQ || "",
        status: targetStatus,
        sort: "startAt",
        order: "asc",
      });

      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setExams(list);
      setTotalPages(Math.max(1, res?.pagination?.totalPages || 1));
    } catch (e) {
      setError(e.message || "Erreur lors du chargement des examens");
      setExams([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams(page, searchTerm, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      loadExams(1, searchTerm, status);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const sectionTitle = useMemo(() => {
    if (status === "open") return "Examens ouverts";
    if (status === "upcoming") return "Examens à venir";
    if (status === "closed") return "Examens fermés";
    return "Tous les examens";
  }, [status]);

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
      value={status}
      onChange={(e) => {
        setPage(1);
        setStatus(e.target.value);
      }}
      style={{
        border: "1px solid #cbd5e1",
        borderRadius: 10,
        padding: "10px 12px",
        background: "white",
      }}
    >
      <option value="all">Tous</option>
      <option value="open">Ouverts</option>
      <option value="upcoming">À venir</option>
      <option value="closed">Fermés</option>
    </select>
  );

  return (
    <StudentShell
      title="Mes Examens"
      subtitle="Consultez et lancez vos examens disponibles."
      error={error}
      searchSlot={searchSlot}
      rightSlot={rightSlot}
    >
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 14 }}>{sectionTitle}</h2>

      {loading ? (
        <div className="sd-exam-grid">
          {[1, 2, 3].map((k) => (
            <div key={k} className="sd-skeleton" style={{ height: 220 }} />
          ))}
        </div>
      ) : exams.length === 0 ? (
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
          Aucun examen trouvé.
        </div>
      ) : (
        <div className="sd-exam-grid">
          {exams.map((ex) => (
            <div key={ex._id} className="sd-exam-card">
              <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
                ID: {ex._id.slice(-6)}
              </p>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>{ex.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16 }}>
                {ex.description || "Aucune description."}
              </p>

              <div style={{ fontSize: 13, color: "#475569", display: "grid", gap: 4 }}>
                <p>⏱ Durée: {ex.durationMinutes} min</p>
                <p>✍️ Tentatives: {ex.maxAttempts || 1}</p>
                <p>📌 Statut: {ex.availabilityStatus || "open"}</p>
              </div>

              <Link to={`/student/exams/${ex._id}`} className="sd-btn-pass">
                Commencer
              </Link>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 24 }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            border: "1px solid #cbd5e1",
            background: "white",
            borderRadius: 10,
            padding: "8px 12px",
            opacity: page <= 1 ? 0.5 : 1,
          }}
        >
          Précédent
        </button>

        <span style={{ color: "#64748b", fontSize: 14 }}>
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
            opacity: page >= totalPages ? 0.5 : 1,
          }}
        >
          Suivant
        </button>
      </div>
    </StudentShell>
  );
}