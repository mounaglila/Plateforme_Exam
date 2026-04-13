import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { loginApi } from "../../api/auth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    background: #f5f3ff;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .login-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    background: white;
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 28px;
    box-shadow: 0 8px 40px rgba(99,102,241,0.1);
    padding: 44px 40px 36px;
    animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .login-brand {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 700;
    color: #4f46e5; margin-bottom: 24px;
    letter-spacing: -0.02em;
  }

  .login-brand-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, #818cf8, #6366f1);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 20px;
    font-family: 'Cormorant Garamond', serif; font-weight: 700;
  }

  .login-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 700;
    color: #1e1b4b;
    text-align: center;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .login-subtitle {
    font-size: 14px; color: #9ca3af;
    text-align: center; margin-bottom: 32px;
    font-weight: 500;
  }

  .field-group { margin-bottom: 16px; }

  .field-label {
    display: block;
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    color: #6366f1; margin-bottom: 8px;
  }

  .field-wrapper { position: relative; }

  .field-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #a5b4fc; display: flex; pointer-events: none;
  }

  .field-input {
    width: 100%;
    background: #fafafa;
    border: 1.5px solid rgba(99,102,241,0.15);
    border-radius: 14px;
    padding: 13px 16px 13px 42px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 500;
    color: #2d2b4e;
    outline: none;
    transition: all 0.2s ease;
  }

  .field-input::placeholder { color: #c4b5fd; }

  .field-input:focus {
    border-color: #6366f1;
    background: white;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
  }

  .error-box {
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 13px; color: #dc2626;
    font-weight: 600;
    display: flex; align-items: center; gap: 8px;
    animation: shake 0.4s ease;
  }

  .info-box {
    background: rgba(34,197,94,0.07);
    border: 1px solid rgba(34,197,94,0.2);
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 13px; color: #16a34a;
    font-weight: 600;
    display: flex; align-items: center; gap: 8px;
  }

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-4px); }
    40%,80%  { transform: translateX(4px); }
  }

  .submit-btn {
    width: 100%; padding: 14px;
    border: none; border-radius: 14px;
    background: #4f46e5;
    color: white;
    font-family: 'Nunito', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer; margin-top: 8px;
    transition: background 0.2s, transform 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .submit-btn:hover:not(:disabled) { background: #4338ca; transform: translateY(-2px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .login-footer {
    margin-top: 22px; text-align: center;
    font-size: 13px; color: #9ca3af; font-weight: 500;
  }

  .login-footer a {
    color: #6366f1; font-weight: 700;
    text-decoration: none; margin-left: 4px;
    transition: color 0.2s;
  }
  .login-footer a:hover { color: #4338ca; }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .divider-line {
    flex: 1; height: 1px;
    background: rgba(99,102,241,0.12);
  }
  .divider-text {
    font-size: 11px; color: #c4b5fd;
    font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  }
`;

export default function Login() {
  const history = useHistory();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const msg = location.state?.message;
    if (msg) setInfo(msg);
    if (location.state?.registrationPending) {
      history.replace({ pathname: "/auth/login", state: {} });
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      localStorage.setItem(
        "auth",
        JSON.stringify({
          token: data.token,
          user: {
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            enrollmentStatus: data.enrollmentStatus,
          },
        })
      );
      if (data.role === "admin") history.push("/admin/dashboard");
      else if (data.role === "professor") history.push("/professor/dashboard");
      else history.push("/student/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">E</div>
            EduSmart
          </div>

          <h1 className="login-title">Bon retour !</h1>
          <p className="login-subtitle">Connectez-vous à votre espace</p>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">identifiants</span>
            <div className="divider-line" />
          </div>

          {info && (
            <div className="info-box">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="#16a34a" strokeWidth="1.4"/>
                <path d="M5 7.5L7 9.5L10.5 6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {info}
            </div>
          )}

          {error && (
            <div className="error-box">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="#dc2626" strokeWidth="1.4"/>
                <path d="M7.5 4.5V8" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7.5" cy="10.5" r="0.75" fill="#dc2626"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="field-wrapper">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="#a5b4fc" strokeWidth="1.3"/>
                    <path d="M1.5 5.5L8 9.5L14.5 5.5" stroke="#a5b4fc" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Mot de passe</label>
              <div className="field-wrapper">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#a5b4fc" strokeWidth="1.3"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="#a5b4fc" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="8" cy="10.5" r="1" fill="#a5b4fc"/>
                  </svg>
                </span>
                <input
                  type="password"
                  className="field-input"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <div className="login-footer">
            <span>Pas encore de compte ?</span>
            <Link to="/auth/register">S'inscrire</Link>
          </div>
        </div>
      </div>
    </>
  );
}