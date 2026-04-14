import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@400;500;600;700&display=swap');
        .hp-root {
          min-height: 100vh;
          background: #f5f3ff;
          font-family: 'Nunito', sans-serif;
          color: #2d2b4e;
          position: relative;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          opacity: 0.55;
          filter: blur(70px);
        }
        .blob-1 { width: 420px; height: 320px; background: #c7d2fe; top: -80px; left: -80px; }
        .blob-2 { width: 380px; height: 300px; background: #bae6fd; bottom: -60px; right: -60px; }
        .blob-3 { width: 260px; height: 220px; background: #bbf7d0; top: 40%; right: 12%; }
        .blob-4 { width: 200px; height: 180px; background: #fde68a; top: 60%; left: 18%; }

        .hp-nav {
          position: relative; z-index: 10;
          max-width: 1100px; margin: 0 auto;
          padding: 24px 32px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .hp-logo {
  display: flex; align-items: center; gap: 10px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  color: #4f46e5;
  text-decoration: none;
  letter-spacing: -0.02em;
}

.hp-logo-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, #818cf8, #6366f1);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 22px;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 700;
}

        .hp-nav-btn {
          background: #4f46e5;
          color: white;
          border: none; border-radius: 12px;
          padding: 10px 22px;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
          display: inline-block;
        }
        .hp-nav-btn:hover { background: #4338ca; transform: translateY(-1px); }

        .hp-hero {
          position: relative; z-index: 5;
          max-width: 1100px; margin: 0 auto;
          padding: 60px 32px 80px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
        }

        .hp-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: #e0e7ff; color: #4338ca;
          border-radius: 999px; padding: 6px 14px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.03em;
          margin-bottom: 20px;
        }

        .hp-dot { width: 7px; height: 7px; border-radius: 999px; background: #818cf8; display: inline-block; }

        .hp-title {
  margin: 0 0 18px;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(42px, 6vw, 72px);
  line-height: 1.05;
  color: #1e1b4b;
  font-weight: 700;
  letter-spacing: -0.02em;
}
        .hp-title span { color: #6366f1; }

        .hp-sub {
  font-size: 18px;
  line-height: 1.75;
  color: #6b7280;
  margin: 0 0 32px;
  max-width: 480px;
}

        .hp-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #4f46e5; color: white;
          border-radius: 14px; padding: 14px 26px;
          font-family: 'DM Sans', sans-serif; font-weight: 800; font-size: 15px;
          text-decoration: none; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          border: none;
        }
        .hp-cta:hover { background: #4338ca; transform: translateY(-2px); }

        .hp-stats {
          display: flex; gap: 24px; margin-top: 40px;
        }
        .hp-stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px;
  color: #1e1b4b;
  font-weight: 700;
}

.hp-stat-label {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}


        .lp-panel {
  background: white;
  border: 1px solid rgba(99,102,241,0.12);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 4px 24px rgba(99,102,241,0.08);
}

.lp-panel h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-family: 'Cormorant Garamond', serif;
  color: #1e1b4b;
  font-weight: 800;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lp-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lp-list li {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fafafa;
  border: 1px solid rgba(99,102,241,0.08);
  border-left: 3px solid #6366f1;
  border-radius: 14px;
  padding: 14px 16px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  transition: transform 0.15s, box-shadow 0.15s;
}

.lp-list li:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(99,102,241,0.1);
}

.lp-list li:nth-child(1) { border-left-color: #6366f1; }
.lp-list li:nth-child(2) { border-left-color: #06b6d4; }
.lp-list li:nth-child(3) { border-left-color: #22c55e; }
.lp-list li:nth-child(4) { border-left-color: #f59e0b; }

.dot {
  width: 34px; height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}

.lp-list li:nth-child(1) .dot { background: #ede9fe; }
.lp-list li:nth-child(2) .dot { background: #cffafe; }
.lp-list li:nth-child(3) .dot { background: #dcfce7; }
.lp-list li:nth-child(4) .dot { background: #fef3c7; }
        
        @media (max-width: 820px) {
          .hp-hero { grid-template-columns: 1fr; padding: 36px 20px 60px; }
          .hp-stats { gap: 16px; }
        }
      `}</style>

      <div className="hp-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        <nav className="hp-nav">
          <div className="hp-logo">
            <div className="hp-logo-icon">E</div>
            EduSmart
          </div>
          <Link to="/auth/login" className="hp-nav-btn">Se connecter</Link>
        </nav>

        <main className="hp-hero">
          <section>
            <div className="hp-eyebrow">
              <span className="hp-dot" />
              Plateforme d'évaluation en ligne
            </div>
            <h1 className="hp-title">
              Gérez vos examens<br />
              <span>simplement</span> et<br />intelligemment.
            </h1>
            <p className="hp-sub">
              Créez, planifiez et faites passer des examens dans une expérience fluide.
              Suivez les résultats et les performances en temps réel.
            </p>
            <Link to="/auth/register" className="hp-cta">
              Commencer maintenant →
            </Link>
           
          </section>

          <aside className="lp-panel" id="features">
            <h3>Pourquoi EduSmart ?</h3>
            <ul className="lp-list">
              <li><span className="dot">📝</span> Création d'examens rapide et flexible</li>
            <li><span className="dot">🔒</span> Passage d'examen sécurisé pour les étudiants</li>
            <li><span className="dot">📊</span> Statistiques et résultats en temps réel</li>
            <li><span className="dot">🎯</span> Tableaux de bord clairs pour chaque rôle</li>
            </ul>
          </aside>
        </main>
      </div>
    </>
  );
}