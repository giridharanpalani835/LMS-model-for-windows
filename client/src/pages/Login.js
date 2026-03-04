// pages/Login.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --purple:       #5624d0;
    --purple-hover: #3b1a9a;
    --purple-soft:  #7c4ddf;
    --purple-ghost: rgba(86,36,208,0.07);
    --purple-glow:  rgba(86,36,208,0.16);
    --orange:       #f69c08;
    --dark:         #1c1d1f;
    --charcoal:     #2d2e30;
    --mid:          #3d3d3d;
    --gray:         #6a6f73;
    --muted:        #9ca3af;
    --border:       #e2e5e9;
    --white:        #ffffff;
    --cream:        #faf9f7;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--dark);
  }

  /* ══════════════════════════════════════
     FULL-SCREEN WRAPPER
     Grid: dark left branding | white right form
  ══════════════════════════════════════ */
  .lp-root {
    display: grid;
    grid-template-columns: 1fr 520px;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  /* ══════════════════════════════════════
     LEFT — dark branding panel
  ══════════════════════════════════════ */
  .lp-left {
    position: relative;
    background: var(--dark);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Subtle crosshatch grid */
  .lp-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
    background-size: 56px 56px;
    z-index: 0;
    pointer-events: none;
  }

  /* Purple ambient glow — bottom right */
  .lp-glow {
    position: absolute;
    width: 560px;
    height: 560px;
    background: radial-gradient(circle, rgba(86,36,208,0.2) 0%, transparent 65%);
    bottom: -160px;
    right: -120px;
    pointer-events: none;
    z-index: 0;
  }

  /* Secondary glow — top left */
  .lp-glow2 {
    position: absolute;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(246,156,8,0.07) 0%, transparent 70%);
    top: -80px;
    left: -60px;
    pointer-events: none;
    z-index: 0;
  }

  /* Top bar */
  .lp-left-top {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 52px;
  }

  .lp-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .lp-logo-icon {
    width: 36px;
    height: 36px;
    background: var(--purple);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lp-logo-icon::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 9px;
    height: 9px;
    background: var(--orange);
  }

  .lp-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: var(--white);
    letter-spacing: 0.3px;
  }

  .lp-nav-pill {
    padding: 7px 16px;
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
    font-size: 12px;
    font-weight: 500;
    background: rgba(255,255,255,0.04);
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
    letter-spacing: 0.3px;
  }

  .lp-nav-pill:hover {
    border-color: rgba(255,255,255,0.2);
    color: var(--white);
    background: rgba(255,255,255,0.07);
  }

  /* Centre content */
  .lp-left-body {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 52px 48px;
  }

  /* Beta tag */
  .lp-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 13px;
    background: rgba(246,156,8,0.09);
    border: 1px solid rgba(246,156,8,0.2);
    width: fit-content;
    margin-bottom: 32px;
  }

  .lp-tag-dot {
    width: 5px;
    height: 5px;
    background: var(--orange);
    border-radius: 50%;
    animation: blink 2s ease infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  .lp-tag-text {
    font-size: 10px;
    font-weight: 700;
    color: var(--orange);
    text-transform: uppercase;
    letter-spacing: 1.3px;
  }

  /* Hero headline */
  .lp-headline {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(48px, 5vw, 76px);
    line-height: 0.94;
    color: var(--white);
    margin-bottom: 28px;
    letter-spacing: -1px;
  }

  .lp-headline em {
    font-style: italic;
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(255,255,255,0.42);
  }

  .lp-headline .hl-orange {
    color: var(--orange);
    display: block;
  }

  .lp-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.36);
    line-height: 1.75;
    max-width: 360px;
    margin-bottom: 48px;
    font-weight: 300;
  }

  /* Feature list — no numbers, just line separators */
  .lp-features {
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  .lp-feature {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 13px;
    color: rgba(255,255,255,0.36);
    font-weight: 400;
  }

  .lp-feature-dash {
    width: 18px;
    height: 1px;
    background: var(--purple-soft);
    flex-shrink: 0;
    opacity: 0.7;
  }

  /* Bottom strip */
  .lp-left-footer {
    position: relative;
    z-index: 2;
    padding: 18px 52px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .lp-copy {
    font-size: 11px;
    color: rgba(255,255,255,0.16);
  }

  .lp-bars {
    display: flex;
    gap: 4px;
  }

  .lp-b { border-radius: 2px; height: 3px; }
  .lp-b1 { width: 32px; background: var(--purple); }
  .lp-b2 { width: 18px; background: var(--orange); }
  .lp-b3 { width: 10px; background: rgba(255,255,255,0.09); }

  /* ══════════════════════════════════════
     RIGHT — centered login card
  ══════════════════════════════════════ */
  .lp-right {
    background: var(--cream);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;   /* vertical center */
    overflow-y: auto;
    border-left: 1px solid rgba(0,0,0,0.08);
    padding: 40px 48px;
    gap: 0;
  }

  /* The card itself */
  .lp-card {
    width: 100%;
    max-width: 380px;
    animation: fadeUp 0.35s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Card header */
  .lp-card-eyebrow {
    font-size: 10px;
    font-weight: 800;
    color: var(--purple);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 8px;
  }

  .lp-card-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: var(--dark);
    line-height: 1.12;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
    white-space: pre-line;
  }

  .lp-card-sub {
    font-size: 13px;
    color: var(--gray);
    margin-bottom: 28px;
    line-height: 1.55;
    font-weight: 400;
  }

  /* Tabs */
  .lp-tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
    margin-bottom: 24px;
  }

  .lp-tab {
    padding: 9px 16px 9px 0;
    background: none;
    border: none;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    color: var(--muted);
    cursor: pointer;
    position: relative;
    margin-right: 12px;
    letter-spacing: 0.2px;
    transition: color 0.15s;
  }

  .lp-tab::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 12px;
    height: 2px;
    background: var(--purple);
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }

  .lp-tab.active { color: var(--dark); }
  .lp-tab.active::after { transform: scaleX(1); }
  .lp-tab:hover:not(.active) { color: var(--mid); }

  /* Fields */
  .lp-field { margin-bottom: 16px; }

  .lp-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    color: var(--charcoal);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  .lp-input {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    background: var(--white);
    font-size: 14px;
    font-family: inherit;
    color: var(--dark);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
  }

  .lp-input::placeholder { color: #c5cad0; }

  .lp-input:focus {
    border-color: var(--purple);
    box-shadow: 0 0 0 3px var(--purple-glow);
  }

  /* Password + show/hide */
  .lp-input-wrap { position: relative; }
  .lp-input-wrap .lp-input { padding-right: 52px; }

  .lp-show-btn {
    position: absolute;
    right: 13px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    font-weight: 800;
    color: var(--purple);
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    user-select: none;
    background: none;
    border: none;
    font-family: inherit;
    padding: 0;
  }

  /* Forgot */
  .lp-forgot {
    display: flex;
    justify-content: flex-end;
    margin-top: -8px;
    margin-bottom: 16px;
  }

  .lp-forgot a {
    font-size: 11px;
    color: var(--purple);
    text-decoration: none;
    font-weight: 600;
  }

  .lp-forgot a:hover { text-decoration: underline; }

  /* Role cards */
  .lp-role-group { margin-bottom: 16px; }

  .lp-role-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .lp-role-card {
    padding: 12px 14px;
    border: 1.5px solid var(--border);
    background: var(--white);
    cursor: pointer;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    transition: all 0.15s;
  }

  .lp-role-card.active {
    border-color: var(--purple);
    background: var(--purple-ghost);
  }

  .lp-role-card:hover:not(.active) {
    border-color: #bcc0c5;
    background: #f2f2f2;
  }

  .lp-role-emoji { font-size: 19px; line-height: 1; }

  .lp-role-title {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: var(--dark);
  }

  .lp-role-desc {
    display: block;
    font-size: 11px;
    color: var(--gray);
    margin-top: 1px;
  }

  .lp-role-radio {
    width: 13px;
    height: 13px;
    border: 2px solid var(--border);
    border-radius: 50%;
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s;
  }

  .lp-role-card.active .lp-role-radio { border-color: var(--purple); }

  .lp-role-card.active .lp-role-radio::after {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--purple);
  }

  /* Submit button */
  .lp-btn {
    width: 100%;
    padding: 13px 24px;
    background: var(--dark);
    color: var(--white);
    border: 2px solid var(--dark);
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    letter-spacing: 0.3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 4px;
    position: relative;
    overflow: hidden;
    transition: background 0.18s, border-color 0.18s;
  }

  .lp-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(86,36,208,0.15), transparent);
    transform: translateX(-100%);
    transition: transform 0.45s ease;
  }

  .lp-btn:hover:not(:disabled)::before { transform: translateX(100%); }

  .lp-btn:hover:not(:disabled) {
    background: var(--purple);
    border-color: var(--purple);
  }

  .lp-btn:active:not(:disabled) { transform: scale(0.99); }
  .lp-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .lp-btn-arrow {
    font-size: 15px;
    transition: transform 0.15s;
  }

  .lp-btn:hover .lp-btn-arrow { transform: translateX(3px); }

  /* Spinner */
  .lp-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.65s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Divider */
  .lp-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 18px 0;
  }

  .lp-div-line { flex: 1; height: 1px; background: var(--border); }

  .lp-div-text {
    font-size: 10px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }

  /* Google button */
  .lp-google-btn {
    width: 100%;
    padding: 10px 20px;
    border: 1.5px solid var(--border);
    background: var(--white);
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    color: var(--dark);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .lp-google-btn:hover {
    border-color: #aaa;
    box-shadow: 0 1px 5px rgba(0,0,0,0.07);
  }

  /* Demo box */
  .lp-demo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 12px;
    background: var(--white);
    border: 1px solid var(--border);
    border-left: 3px solid var(--orange);
    margin-top: 20px;
    margin-bottom: 14px;
  }

  .lp-demo-badge {
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--orange);
    white-space: nowrap;
  }

  .lp-demo-creds {
    font-size: 11px;
    color: var(--mid);
    font-family: 'Courier New', monospace;
  }

  /* Terms */
  .lp-terms {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.6;
    text-align: center;
  }

  .lp-terms a { color: var(--purple); text-decoration: none; font-weight: 600; }
  .lp-terms a:hover { text-decoration: underline; }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    html, body { overflow: auto; }
    .lp-root {
      grid-template-columns: 1fr;
      height: auto;
    }
    .lp-left { min-height: 320px; }
    .lp-right { overflow-y: visible; min-height: 100vh; }
  }

  @media (max-width: 640px) {
    .lp-left { display: none; }
    .lp-right { padding: 36px 28px; }
  }
`;

const Login = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password);
      } else {
        user = await register(form.name, form.email, form.password, form.role);
      }
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      // if the request never reached the server (CORS / network issue) there
      // won't be a response payload; fall back to the error message from axios.
      toast.error(
        err.response?.data?.message || err.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="lp-root">

        {/* ════════════ LEFT PANEL ════════════ */}
        <div className="lp-left">
          <div className="lp-glow" />
          <div className="lp-glow2" />

          <div className="lp-left-top">
            <div className="lp-logo">
              <div className="lp-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
                  <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55"/>
                  <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75"/>
                </svg>
              </div>
              <span className="lp-logo-text">EduFlow</span>
            </div>
            <button className="lp-nav-pill" type="button">Browse Courses ↗</button>
          </div>

          <div className="lp-left-body">
            <div className="lp-tag">
              <span className="lp-tag-dot" />
              <span className="lp-tag-text">Now in Public Beta</span>
            </div>

            <h1 className="lp-headline">
              Master<br />
              <em>every</em><br />
              <span className="hl-orange">skill.</span>
            </h1>

            <p className="lp-sub">
              A professional learning management system built for modern educators and ambitious students. Structured, measurable, results-driven.
            </p>

            <div className="lp-features">
              {[
                'Assignments & auto-grading',
                'Performance analytics dashboard',
                'Role-based access control',
                'Real-time collaboration tools',
                'Access from any device, anytime',
              ].map((f) => (
                <div className="lp-feature" key={f}>
                  <div className="lp-feature-dash" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="lp-left-footer">
            <span className="lp-copy">© 2025 EduFlow LMS</span>
            <div className="lp-bars">
              <div className="lp-b lp-b1" />
              <div className="lp-b lp-b2" />
              <div className="lp-b lp-b3" />
            </div>
          </div>
        </div>

        {/* ════════════ RIGHT — centered card ════════════ */}
        <div className="lp-right">
          <div className="lp-card" key={mode}>

            <div className="lp-card-eyebrow">
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </div>

            <h2 className="lp-card-heading">
              {mode === 'login'
                ? 'Sign in to your\naccount'
                : 'Create your\naccount'}
            </h2>

            <p className="lp-card-sub">
              {mode === 'login'
                ? 'Enter your credentials to access your dashboard.'
                : 'Join thousands of learners and educators today.'}
            </p>

            {/* Tabs */}
            <div className="lp-tabs">
              <button
                type="button"
                className={`lp-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`lp-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {mode === 'register' && (
                <div className="lp-field">
                  <label className="lp-label" htmlFor="inp-name">Full Name</label>
                  <input
                    id="inp-name"
                    className="lp-input"
                    name="name"
                    type="text"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="lp-field">
                <label className="lp-label" htmlFor="inp-email">Email Address</label>
                <input
                  id="inp-email"
                  className="lp-input"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="lp-field">
                <label className="lp-label" htmlFor="inp-password">Password</label>
                <div className="lp-input-wrap">
                  <input
                    id="inp-password"
                    className="lp-input"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                  />
                  <button
                    type="button"
                    className="lp-show-btn"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="lp-forgot">
                  <a href="#">Forgot password?</a>
                </div>
              )}

              {mode === 'register' && (
                <div className="lp-role-group">
                  <label className="lp-label">I am a</label>
                  <div className="lp-role-grid">
                    {[
                      { val: 'student', emoji: '🎓', title: 'Student', desc: 'I want to learn' },
                      { val: 'teacher', emoji: '🏫', title: 'Teacher', desc: 'I want to teach' },
                    ].map(({ val, emoji, title, desc }) => (
                      <button
                        key={val}
                        type="button"
                        className={`lp-role-card ${form.role === val ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, role: val })}
                      >
                        <span className="lp-role-emoji">{emoji}</span>
                        <div>
                          <span className="lp-role-title">{title}</span>
                          <span className="lp-role-desc">{desc}</span>
                        </div>
                        <div className="lp-role-radio" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="lp-btn" type="submit" disabled={loading}>
                {loading ? (
                  <><span className="lp-spinner" /> Processing…</>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <span className="lp-btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="lp-divider">
              <div className="lp-div-line" />
              <span className="lp-div-text">or</span>
              <div className="lp-div-line" />
            </div>

            <button className="lp-google-btn" type="button">
              <svg width="17" height="17" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 7.5 29 5.5 24 5.5 13.2 5.5 4.5 14.2 4.5 25S13.2 44.5 24 44.5 43.5 35.8 43.5 25c0-1.6-.2-3.2-.5-4.7z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 7.5 29 5.5 24 5.5c-7.7 0-14.3 4.4-17.7 9.2z"/>
                <path fill="#4CAF50" d="M24 44.5c4.9 0 9.4-1.9 12.8-5L30.9 34c-1.9 1.4-4.3 2.2-6.9 2.2-5.2 0-9.6-3.5-11.2-8.2l-6.6 5.1C9.5 39.9 16.2 44.5 24 44.5z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6 4.9c6.3-4.6 6.3-13.3 6.3-13.3 0-1.6-.2-3.2-.5-4.7z"/>
              </svg>
              Continue with Google
            </button>

            <div className="lp-demo">
              <span className="lp-demo-badge">Demo</span>
              <span className="lp-demo-creds">admin@lms.com &nbsp;/&nbsp; password123</span>
            </div>

            <p className="lp-terms">
              By continuing you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>

          </div>
        </div>

      </div>
    </>
  );
};

export default Login;