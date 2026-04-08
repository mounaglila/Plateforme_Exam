import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { registerApi } from "../../api/auth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .register-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #e8d5f5 0%, #fde8f0 30%, #d5eef5 60%, #fef3d0 100%);
    background-size: 400% 400%;
    animation: gradientShift 12s ease infinite;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }

  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.45;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 {
    width: 420px; height: 420px;
    background: radial-gradient(circle, #c084fc, #f9a8d4);
    top: -100px; left: -120px;
    animation: floatA 9s ease-in-out infinite;
  }
  .blob-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, #67e8f9, #a5f3fc);
    bottom: -80px; right: -100px;
    animation: floatB 11s ease-in-out infinite;
  }
  .blob-3 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, #fde68a, #fca5a5);
    top: 40%; left: 60%;
    animation: floatC 8s ease-in-out infinite;
  }

  @keyframes floatA {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(40px, 30px) scale(1.08); }
  }
  @keyframes floatB {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-30px, -40px) scale(1.06); }
  }
  @keyframes floatC {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-20px, 25px) scale(1.1); }
  }

  .card-wrapper {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 540px;
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(36px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .glass-card {
    background: rgba(255,255,255,0.52);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1.5px solid rgba(255,255,255,0.75);
    border-radius: 28px;
    box-shadow: 0 8px 48px rgba(160,100,220,0.10), 0 2px 16px rgba(0,0,0,0.06);
    padding: 2.8rem 2.8rem 2.2rem;
  }

  .brand-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, #c084fc, #f472b6);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem;
    box-shadow: 0 4px 20px rgba(192,132,252,0.35);
  }

  .brand-icon svg {
    width: 26px; height: 26px;
    fill: white;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    color: #3b1f5e;
    text-align: center;
    margin-bottom: 0.3rem;
    letter-spacing: -0.02em;
  }

  .card-subtitle {
    text-align: center;
    font-size: 0.85rem;
    color: #9b7cb8;
    font-weight: 400;
    margin-bottom: 1.8rem;
  }

  .divider {
    height: 1.5px;
    background: linear-gradient(to right, transparent, rgba(192,132,252,0.3), transparent);
    margin-bottom: 1.8rem;
  }

  .error-box {
    background: rgba(254,202,202,0.5);
    border: 1px solid rgba(252,165,165,0.6);
    border-radius: 12px;
    padding: 0.7rem 1rem;
    color: #b91c1c;
    font-size: 0.82rem;
    margin-bottom: 1.2rem;
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-5px); }
    40%,80%  { transform: translateX(5px); }
  }

  .field-group {
    margin-bottom: 1.1rem;
  }

  .field-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7c5a9e;
    margin-bottom: 0.45rem;
  }

  .input-wrap {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #c084fc;
    pointer-events: none;
  }

  .input-icon svg {
    width: 17px; height: 17px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .pastel-input {
    width: 100%;
    padding: 0.75rem 0.95rem 0.75rem 2.65rem;
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(192,132,252,0.22);
    border-radius: 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #3b1f5e;
    outline: none;
    transition: all 0.22s ease;
    box-shadow: 0 2px 8px rgba(192,132,252,0.06);
    box-sizing: border-box;
  }

  .pastel-input::placeholder { color: #c4aad8; }

  .pastel-input:focus {
    border-color: rgba(192,132,252,0.6);
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 0 4px rgba(192,132,252,0.12), 0 2px 8px rgba(192,132,252,0.08);
  }

  .role-label-text {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7c5a9e;
    margin-bottom: 0.6rem;
  }

  .role-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.55rem;
    margin-bottom: 1.1rem;
  }

  .role-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 0.75rem 0.4rem;
    border-radius: 14px;
    border: 1.5px solid rgba(192,132,252,0.2);
    background: rgba(255,255,255,0.55);
    cursor: pointer;
    transition: all 0.22s ease;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: #7c5a9e;
    user-select: none;
  }

  .role-card:hover {
    border-color: rgba(192,132,252,0.5);
    background: rgba(255,255,255,0.8);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(192,132,252,0.15);
  }

  .role-card.active {
    border-color: #c084fc;
    background: linear-gradient(135deg, rgba(192,132,252,0.18), rgba(244,114,182,0.12));
    box-shadow: 0 4px 20px rgba(192,132,252,0.22);
    color: #7c3aed;
    font-weight: 600;
  }

  .role-card .role-icon {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(192,132,252,0.12);
    transition: all 0.22s ease;
  }

  .role-card.active .role-icon {
    background: linear-gradient(135deg, #c084fc, #f472b6);
    box-shadow: 0 3px 12px rgba(192,132,252,0.3);
  }

  .role-card .role-icon svg {
    width: 17px; height: 17px;
    stroke: #c084fc;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: all 0.22s ease;
  }

  .role-card.active .role-icon svg {
    stroke: white;
  }

  .submit-btn {
    width: 100%;
    padding: 0.85rem;
    border: none;
    border-radius: 15px;
    background: linear-gradient(135deg, #c084fc 0%, #f472b6 100%);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.22s ease;
    box-shadow: 0 4px 20px rgba(192,132,252,0.35);
    margin-top: 0.5rem;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(192,132,252,0.45);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2.5px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 8px;
    vertical-align: middle;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-link {
    text-align: center;
    margin-top: 1.5rem;
    font-size: 0.83rem;
    color: #9b7cb8;
  }

  .login-link a {
    color: #a855f7;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1.5px solid rgba(168,85,247,0.3);
    padding-bottom: 1px;
    transition: all 0.18s ease;
  }

  .login-link a:hover {
    color: #7c3aed;
    border-bottom-color: #7c3aed;
  }

  .dots {
    position: fixed;
    z-index: 1;
    pointer-events: none;
  }
  .dots-tl { top: 60px; left: 40px; }
  .dots-br { bottom: 60px; right: 40px; }
  .dots svg circle { animation: dotPulse 3s ease-in-out infinite; }
  .dots svg circle:nth-child(2) { animation-delay: 0.4s; }
  .dots svg circle:nth-child(3) { animation-delay: 0.8s; }

  @keyframes dotPulse {
    0%,100% { opacity: 0.25; r: 3; }
    50%      { opacity: 0.6;  r: 4; }
  }

  .pastel-select {
    width: 100%;
    padding: 0.75rem 0.95rem 0.75rem 2.65rem;
    background: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(192,132,252,0.22);
    border-radius: 13px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: #3b1f5e;
    outline: none;
    transition: all 0.22s ease;
    box-shadow: 0 2px 8px rgba(192,132,252,0.06);
    box-sizing: border-box;
    appearance: none;
    cursor: pointer;
  }
  .pastel-select:focus {
    border-color: rgba(192,132,252,0.6);
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 0 4px rgba(192,132,252,0.12);
  }
`;

const ROLES = [
  {
    value: "student",
    label: "Student",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
      </svg>
    ),
  },
  {
    value: "professor",
    label: "Professor",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        <path d="M17 11l2 2 4-4"/>
      </svg>
    ),
  },
];

export default function Register() {
  const history = useHistory();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("student");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerApi({ name, email, password, role });
      if (data.token) {
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
        if (data.role === "professor") history.push("/professor/dashboard");
        else history.push("/student/dashboard");
      } else {
        history.push("/auth/login", {
          registrationPending: true,
          message:
            "Votre compte étudiant a été créé. Un administrateur doit approuver votre inscription avant que vous puissiez vous connecter.",
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="register-root">
        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Decorative dots */}
        <div className="dots dots-tl">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="10" cy="10" r="3" fill="#c084fc" />
            <circle cx="30" cy="10" r="3" fill="#f472b6" />
            <circle cx="50" cy="10" r="3" fill="#67e8f9" />
            <circle cx="10" cy="30" r="3" fill="#fde68a" />
            <circle cx="30" cy="30" r="3" fill="#c084fc" />
            <circle cx="50" cy="30" r="3" fill="#f472b6" />
            <circle cx="10" cy="50" r="3" fill="#67e8f9" />
            <circle cx="30" cy="50" r="3" fill="#fde68a" />
            <circle cx="50" cy="50" r="3" fill="#c084fc" />
          </svg>
        </div>
        <div className="dots dots-br">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="10" cy="10" r="3" fill="#f472b6" />
            <circle cx="30" cy="10" r="3" fill="#c084fc" />
            <circle cx="50" cy="10" r="3" fill="#fde68a" />
            <circle cx="10" cy="30" r="3" fill="#67e8f9" />
            <circle cx="30" cy="30" r="3" fill="#f472b6" />
            <circle cx="50" cy="30" r="3" fill="#c084fc" />
            <circle cx="10" cy="50" r="3" fill="#fde68a" />
            <circle cx="30" cy="50" r="3" fill="#67e8f9" />
            <circle cx="50" cy="50" r="3" fill="#f472b6" />
          </svg>
        </div>

        {/* Card */}
        <div className="card-wrapper">
          <div className="glass-card">

            {/* Brand icon */}
            <div className="brand-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
              </svg>
            </div>

            <h1 className="card-title">Create Account</h1>
            <p className="card-subtitle">Join us — it only takes a moment</p>
            <div className="divider" />

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={onSubmit}>

              {/* Name */}
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="pastel-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    className="pastel-input"
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
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </span>
                  <input
                    type="password"
                    className="pastel-input"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role selector — card style */}
              <div style={{ marginBottom: "1.4rem" }}>
                <span className="role-label-text">I am a...</span>
                <div className="role-grid">
                  {ROLES.map((r) => (
                    <div
                      key={r.value}
                      className={`role-card ${role === r.value ? "active" : ""}`}
                      onClick={() => setRole(r.value)}
                    >
                      <div className="role-icon">{r.icon}</div>
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="login-link">
              Already have an account?{" "}
              <Link to="/auth/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}