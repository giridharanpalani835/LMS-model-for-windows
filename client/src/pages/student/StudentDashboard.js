// pages/student/StudentDashboard.js — Analytics overview for students
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import ScoreChart from '../../components/charts/ScoreChart';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — Udemy palette
// #5624d0 purple  |  #1c1d1f ink  |  #f7f9fa bg  |  #d1d7dc border
// ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#f7f9fa',
  white:      '#ffffff',
  surfaceAlt: '#f0f4f8',
  border:     '#d1d7dc',
  borderMid:  '#b4bcc4',

  ink:        '#1c1d1f',
  inkMid:     '#3d4045',
  inkLight:   '#6a6f73',
  inkFaint:   '#9da3a8',

  purple:     '#5624d0',
  purpleMid:  '#4527a0',
  purpleDim:  '#f0ebff',
  purpleBrd:  '#c4b5fd',

  green:      '#1e6f42',
  greenDim:   '#e6f4ec',
  greenBrd:   '#a3cfb8',

  amber:      '#92400e',
  amberDim:   '#fffbeb',
  amberBrd:   '#fcd34d',

  teal:       '#0e6f73',
  tealDim:    '#e6f6f7',
  tealBrd:    '#99d4d7',

  red:        '#c0392b',
  redDim:     '#fdecea',
  redBrd:     '#f5b7b1',

  rSm: '4px',
  rMd: '8px',
  rLg: '12px',
  rXl: '16px',
  font: "'Source Serif 4', Georgia, serif",
  sans: "'Source Sans 3', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@700;800&family=Source+Sans+3:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0% { background-position:-600px 0; } 100% { background-position:600px 0; } }
    @keyframes countUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    /* ── Root ── */
    .sd-root {
      font-family: ${T.sans};
      color: ${T.ink};
      min-height: 100vh;
      background: ${T.bg};
      padding: 2.25rem 2.25rem 5rem;
    }
    .sd-root ::-webkit-scrollbar { width: 4px; }
    .sd-root ::-webkit-scrollbar-track { background: transparent; }
    .sd-root ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 99px; }

    /* ── Page Header ── */
    .ph-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 2px solid ${T.ink};
      animation: fadeUp 0.3s ease both;
    }
    .ph-kicker {
      font-family: ${T.mono};
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${T.purple};
      margin-bottom: 0.35rem;
    }
    .ph-title {
      font-family: ${T.font};
      font-size: clamp(1.65rem, 3vw, 2.25rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: ${T.ink};
      line-height: 1.1;
    }
    .ph-title .accent {
      color: ${T.purple};
    }
    .ph-sub {
      font-size: 0.82rem;
      color: ${T.inkLight};
      margin-top: 0.35rem;
    }
    .ph-date {
      font-family: ${T.mono};
      font-size: 0.65rem;
      color: ${T.inkFaint};
      letter-spacing: 0.06em;
      align-self: flex-end;
      padding: 0.3rem 0.75rem;
      background: ${T.white};
      border: 1px solid ${T.border};
      border-radius: ${T.rSm};
    }

    /* ── Section Divider ── */
    .section-divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      animation: fadeUp 0.35s ease 0.05s both;
    }
    .section-divider-label {
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      white-space: nowrap;
    }
    .section-divider-line { flex: 1; height: 1px; background: ${T.border}; }

    /* ── Stats Grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1px;
      background: ${T.border};
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      margin-bottom: 2rem;
      animation: fadeUp 0.35s ease 0.08s both;
    }

    /* ── Stat Cell ── */
    .stat-cell {
      background: ${T.white};
      padding: 1.3rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      position: relative;
      overflow: hidden;
      transition: background 0.12s ease;
    }
    .stat-cell:hover { background: ${T.bg}; }
    .stat-cell::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
    }
    .stat-cell.c-purple::before { background: ${T.purple}; }
    .stat-cell.c-teal::before   { background: ${T.teal}; }
    .stat-cell.c-amber::before  { background: ${T.amber}; }
    .stat-cell.c-green::before  { background: ${T.green}; }

    .stat-label {
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      margin-top: 0.15rem;
    }
    .stat-value {
      font-family: ${T.mono};
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1;
      animation: countUp 0.45s ease both;
    }
    .stat-value.c-purple { color: ${T.purple}; }
    .stat-value.c-teal   { color: ${T.teal}; }
    .stat-value.c-amber  { color: ${T.amber}; }
    .stat-value.c-green  { color: ${T.green}; }

    .stat-icon {
      font-size: 1.2rem;
      line-height: 1;
      margin-bottom: 0.6rem;
      display: block;
    }

    /* ── Chart Card ── */
    .chart-card {
      background: ${T.white};
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      animation: fadeUp 0.4s ease 0.15s both;
    }
    .chart-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.1rem 1.4rem;
      border-bottom: 1px solid ${T.border};
      background: ${T.surfaceAlt};
    }
    .chart-card-title {
      font-family: ${T.mono};
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${T.inkLight};
    }
    .chart-card-badge {
      font-family: ${T.mono};
      font-size: 0.55rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${T.purple};
      background: ${T.purpleDim};
      border: 1px solid ${T.purpleBrd};
      padding: 0.15rem 0.55rem;
      border-radius: ${T.rSm};
    }
    .chart-card-body { padding: 1.4rem; }

    /* ── Empty State ── */
    .empty-state {
      padding: 3.5rem 2rem;
      text-align: center;
    }
    .empty-icon  { font-size: 2.25rem; opacity: 0.2; margin-bottom: 0.85rem; }
    .empty-title {
      font-family: ${T.font};
      font-size: 1rem; font-weight: 700;
      color: ${T.inkMid}; letter-spacing: -0.02em; margin-bottom: 0.35rem;
    }
    .empty-sub { font-size: 0.8rem; color: ${T.inkFaint}; line-height: 1.65; }

    /* ── Skeleton ── */
    .skel {
      border-radius: ${T.rMd};
      background: linear-gradient(90deg, ${T.border} 25%, ${T.surfaceAlt} 50%, ${T.border} 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }
    .skel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// INLINE STAT CARD
// ─────────────────────────────────────────────────────────────
const DashStatCard = ({ icon, label, value, colorKey, delay = '0s' }) => (
  <div className={`stat-cell c-${colorKey}`} style={{ animationDelay: delay }}>
    <span className="stat-icon">{icon}</span>
    <div className={`stat-value c-${colorKey}`}>{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user }            = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  // ── Skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="sd-root">
          <GlobalStyles />
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="skel" style={{ height: 72 }} />
            <div className="skel-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skel" style={{ height: 120 }} />
              ))}
            </div>
            <div className="skel" style={{ height: 320, borderRadius: '12px' }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="sd-root">
        <GlobalStyles />

        {/* ── Page header ── */}
        <div className="ph-row">
          <div>
            <div className="ph-kicker">Student Dashboard</div>
            <h1 className="ph-title">
              Welcome back, <span className="accent">{user?.name}</span>
            </h1>
            <p className="ph-sub">Here's your learning progress at a glance</p>
          </div>
          <div className="ph-date">{now}</div>
        </div>

        {/* ── Section label ── */}
        <div className="section-divider">
          <span className="section-divider-label">Overview</span>
          <div className="section-divider-line" />
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid">
          <DashStatCard
            icon="📝"
            label="Total Submissions"
            value={data?.totalSubmissions ?? 0}
            colorKey="purple"
            delay="0.08s"
          />
          <DashStatCard
            icon="⭐"
            label="Total Score"
            value={data?.totalScore ?? 0}
            colorKey="teal"
            delay="0.12s"
          />
          <DashStatCard
            icon="📈"
            label="Avg Score"
            value={data?.avgScore ?? 0}
            colorKey="amber"
            delay="0.16s"
          />
          <DashStatCard
            icon="🏅"
            label="Current Rank"
            value={data?.rank ? `#${data.rank}` : '—'}
            colorKey="green"
            delay="0.20s"
          />
        </div>

        {/* ── Section label ── */}
        <div className="section-divider" style={{ animationDelay: '0.18s' }}>
          <span className="section-divider-label">Score History</span>
          <div className="section-divider-line" />
        </div>

        {/* ── Chart card ── */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Performance Over Time</div>
            <span className="chart-card-badge">All Submissions</span>
          </div>
          <div className="chart-card-body">
            {data?.scoreHistory?.length > 0 ? (
              <ScoreChart data={data.scoreHistory} />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">◻</div>
                <div className="empty-title">No submissions yet</div>
                <div className="empty-sub">
                  Complete your first assignment to start tracking your progress.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;localStorage