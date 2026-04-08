import React, { useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { loginApi } from "../../api/auth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --pastel-lavender: #e8e0f5;
    --pastel-peach: #fde8dc;
    --pastel-mint: #d6f0e8;
    --pastel-sky: #daeef8;
    --pastel-rose: #f5dde8;
    --accent: #b39ddb;
    --accent-dark: #9575cd;
    --text-primary: #4a3f6b;
    --text-secondary: #8b7faa;
    --text-muted: #b0a8c8;
    --card-bg: rgba(255,255,255,0.55);
    --input-bg: rgba(255,255,255,0.8);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0e9ff 0%, #fce8e8 30%, #e8f4fd 60%, #e0f5ef 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Animated blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.45;
    animation: floatBlob 8s ease-in-out infinite;
  }
  .blob-1 {
    width: 380px; height: 380px;
    background: #e8d5f7;
    top: -80px; left: -100px;
    animation-delay: 0s;
  }
  .blob-2 {
    width: 300px; height: 300px;
    background: #fdd5cf;
    bottom: -60px; right: -80px;
    animation-delay: 2s;
  }
  .blob-3 {
    width: 220px; height: 220px;
    background: #c8eee3;
    top: 40%; left: 10%;
    animation-delay: 4s;
  }
  .blob-4 {
    width: 180px; height: 180px;
    background: #d5e8fc;
    top: 20%; right: 12%;
    animation-delay: 1s;
  }

  @keyframes floatBlob {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-24px) scale(1.05); }
  }

  /* Decorative dots */
  .dots-grid {
    position: absolute;
    width: 200px; height: 200px;
    opacity: 0.18;
  }
  .dots-grid svg circle { fill: var(--accent); }

  /* Card */
  .login-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    background: var(--card-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 28px;
    box-shadow:
      0 8px 32px rgba(179,157,219,0.18),
      0 2px 8px rgba(179,157,219,0.10),
      inset 0 1px 0 rgba(255,255,255,0.9);
    padding: 48px 44px 40px;
    animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(32px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Brand mark */
  .brand-icon {
    width: 54px; height: 54px;
    background: linear-gradient(135deg, #d8c8f8, #f8c8d8);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    box-shadow: 0 4px 16px rgba(179,157,219,0.3);
  }
  .brand-icon svg { width: 26px; height: 26px; }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: center;
    letter-spacing: -0.3px;
    margin-bottom: 6px;
  }

  .card-subtitle {
    font-size: 13.5px;
    color: var(--text-muted);
    text-align: center;
    font-weight: 400;
    margin-bottom: 32px;
    letter-spacing: 0.2px;
  }

  /* Divider */
  .divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(179,157,219,0.3), transparent);
  }
  .divider-text {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }

  /* Error */
  .error-box {
    background: rgba(255,200,200,0.35);
    border: 1px solid rgba(255,150,150,0.4);
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #c0526a;
    font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-5px); }
    40%,80% { transform: translateX(5px); }
  }

  /* Form */
  .field-group { margin-bottom: 18px; }

  .field-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .field-wrapper {
    position: relative;
  }

  .field-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    display: flex;
    pointer-events: none;
  }

  .field-input {
    width: 100%;
    background: var(--input-bg);
    border: 1.5px solid rgba(179,157,219,0.25);
    border-radius: 14px;
    padding: 13px 16px 13px 42px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(179,157,219,0.08);
  }

  .field-input::placeholder { color: var(--text-muted); }

  .field-input:focus {
    border-color: var(--accent);
    background: rgba(255,255,255,0.95);
    box-shadow: 0 0 0 4px rgba(179,157,219,0.18), 0 2px 8px rgba(179,157,219,0.12);
  }

  /* Button */
  .submit-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #c8a8e8 0%, #e8a8c8 100%);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    margin-top: 8px;
    box-shadow: 0 4px 16px rgba(179,157,219,0.4), 0 1px 4px rgba(179,157,219,0.2);
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
  }

  .submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(179,157,219,0.5);
  }
  .submit-btn:hover:not(:disabled)::before { opacity: 1; }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  /* Spinner */
  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer link */
  .login-footer {
    margin-top: 24px;
    text-align: center;
  }
  .login-footer a {
    font-size: 13px;
    color: var(--accent-dark);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    padding-bottom: 1px;
  }
  .login-footer a::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 0; height: 1px;
    background: var(--accent-dark);
    transition: width 0.25s;
  }
  .login-footer a:hover::after { width: 100%; }
  .login-footer span { color: var(--text-muted); font-size: 13px; }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Dots grid pattern
  const DotsGrid = ({ style }) => (
    <svg className="dots-grid" style={style} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={20 + col * 32} cy={20 + row * 32} r={3} />
        ))
      )}
    </svg>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />

        {/* Decorative dots */}
        <DotsGrid style={{ bottom: "8%", left: "5%" }} />
        <DotsGrid style={{ top: "6%", right: "4%" }} />

        {/* Card */}
        <div className="login-card">

          {/* Brand icon */}
          <div className="brand-icon">
            <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3L4 8.5V17.5L13 23L22 17.5V8.5L13 3Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="13" cy="13" r="3.5" fill="white" fillOpacity="0.85"/>
            </svg>
          </div>

          <h1 className="card-title">Welcome back</h1>
          <p className="card-subtitle">Sign in to your account to continue</p>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">credentials</span>
            <div className="divider-line" />
          </div>

          {info && (
            <div className="error-box" style={{ borderColor: "#86efac", background: "rgba(134,239,172,0.15)" }}>
              <span style={{ color: "#166534" }}>{info}</span>
            </div>
          )}

          {error && (
            <div className="error-box">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="#c0526a" strokeWidth="1.4"/>
                <path d="M7.5 4.5V8" stroke="#c0526a" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7.5" cy="10.5" r="0.75" fill="#c0526a"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit}>
            {/* Email */}
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="field-wrapper">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="3.5" width="13" height="9" rx="2" stroke="#b0a8c8" strokeWidth="1.3"/>
                    <path d="M1.5 5.5L8 9.5L14.5 5.5" stroke="#b0a8c8" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrapper">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#b0a8c8" strokeWidth="1.3"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="#b0a8c8" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="8" cy="10.5" r="1" fill="#b0a8c8"/>
                  </svg>
                </span>
                <input
                  type="password"
                  className="field-input"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <span>No account? </span>
            <Link to="/auth/register">Create one</Link>
          </div>
        </div>
      </div>
    </>
  );
}