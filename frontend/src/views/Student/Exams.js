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
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const sectionTitle = useMemo(() => {
    if (status === "open") return "Examens ouverts";
    if (status === "upcoming") return "Examens à venir";
    if (status === "closed") return "Examens fermés";
    return "Tous les examens";
  }, [status]);

  const statusBadge = (st) => {
    const v = (st || "open").toLowerCase();
    if (v === "open") return { label: "Ouvert", bg: "#ecfdf5", color: "#059669" };
    if (v === "upcoming") return { label: "À venir", bg: "#eff6ff", color: "#2563eb" };
    if (v === "closed") return { label: "Fermé", bg: "#f8fafc", color: "#475569" };
    return { label: v, bg: "#f1f5f9", color: "#334155" };
  };

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
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "10px 12px",
        background: "white",
        color: "var(--text-main)",
        fontWeight: 600,
      }}
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
        .se-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .se-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef2ff;
          color: #4338ca;
          font-size: 12px;
          font-weight: 700;
        }

        .se-empty {
          background: white;
          border: 1px dashed var(--border);
          border-radius: 18px;
          padding: 36px 20px;
          text-align: center;
          color: var(--text-muted);
        }

        .se-empty-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 10px;
          border-radius: 14px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .se-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 22px;
        }

        .se-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          transition: all .25s ease;
        }

        .se-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          border-color: #c7d2fe;
        }

        .se-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          gap: 8px;
        }

        .se-id {
          background: #f8fafc;
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
        }

        .se-badge {
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .se-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 4px 0 8px;
        }

        .se-desc {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 14px;
          min-height: 36px;
        }

        .se-meta {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #475569;
          font-weight: 600;
        }

        .se-btn {
          display: block;
          width: 100%;
          text-align: center;
          text-decoration: none;
          border-radius: 12px;
          padding: 11px 12px;
          font-size: 14px;
          font-weight: 800;
          color: white;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          transition: .2s;
        }

        .se-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(79, 70, 229, 0.35);
        }

        .se-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
        }

        .se-page-btn {
          border: 1px solid var(--border);
          background: white;
          border-radius: 10px;
          padding: 8px 12px;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          transition: .2s;
        }

        .se-page-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .se-page-btn:not(:disabled):hover {
          background: #f8fafc;
        }

        .se-page-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        .sd-skeleton {
          border-radius: 20px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
          background-size: 400% 100%;
          animation: se-pulse 1.4s ease infinite;
          border: 1px solid #e2e8f0;
          height: 220px;
        }

        @keyframes se-pulse {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>

      <StudentShell
        title="Mes Examens"
        subtitle="Consultez et lancez vos examens disponibles."
        error={error}
        searchSlot={searchSlot}
        rightSlot={rightSlot}
      >
        <div className="se-toolbar">
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{sectionTitle}</h2>
          <span className="se-chip">{exams.length} examen(s) affiché(s)</span>
        </div>

        {loading ? (
          <div className="se-grid">
            {[1, 2, 3, 4].map((k) => (
              <div key={k} className="sd-skeleton" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="se-empty">
            <div className="se-empty-icon">🗂️</div>
            <p style={{ margin: 0, fontWeight: 700, color: "#334155" }}>Aucun examen trouvé</p>
            <p style={{ margin: "6px 0 0", fontSize: 14 }}>
              Essayez un autre mot-clé ou changez le filtre de statut.
            </p>
          </div>
        ) : (
          <div className="se-grid">
            {exams.map((ex) => {
              const badge = statusBadge(ex.availabilityStatus);
              return (
                <div key={ex._id} className="se-card">
                  <div className="se-card-head">
                    <span className="se-badge" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="se-title">{ex.title}</h3>
                  <p className="se-desc">{ex.description || "Aucune description."}</p>

                  <div className="se-meta">
                    <span>⏱ Durée: {ex.durationMinutes} min</span>
                    <span>✍️ Tentatives: {ex.maxAttempts || 1}</span>
                  </div>

                  <Link to={`/student/exams/${ex._id}`} className="se-btn">
                    Commencer
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="se-pagination">
          <button className="se-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Précédent
          </button>

          <span className="se-page-label">
            Page {page} / {totalPages}
          </span>

          <button className="se-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            Suivant
          </button>
        </div>
      </StudentShell>
    </>
  );
}