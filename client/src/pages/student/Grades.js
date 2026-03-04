// pages/student/Grades.js — Grade history view
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { studentAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — matches Assignments.js light editorial theme
// ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#f8f7f4',
  white:      '#ffffff',
  surfaceAlt: '#f4f3f0',
  border:     '#e2e0da',
  borderMid:  '#ccc9c1',
  ink:        '#0f0e0c',
  inkMid:     '#3d3c39',
  inkLight:   '#6e6c67',
  inkFaint:   '#a8a5a0',
  indigo:     '#3730a3',
  indigoDim:  '#eef2ff',
  indigoBrd:  '#c7d2fe',
  terra:      '#b45309',
  terraDim:   '#fffbeb',
  terraBrd:   '#fde68a',
  green:      '#15803d',
  greenDim:   '#f0fdf4',
  greenBrd:   '#bbf7d0',
  cyan:       '#0e7490',
  cyanDim:    '#ecfeff',
  cyanBrd:    '#a5f3fc',
  violet:     '#6d28d9',
  violetDim:  '#f5f3ff',
  violetBrd:  '#ddd6fe',
  amber:      '#92400e',
  amberDim:   '#fffbeb',
  amberBrd:   '#fcd34d',
  red:        '#b91c1c',
  redDim:     '#fef2f2',
  redBrd:     '#fecaca',
  rSm: '4px',
  rMd: '8px',
  rLg: '12px',
  font: "'Playfair Display', 'Georgia', serif",
  sans: "'Plus Jakarta Sans', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
};

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer  { 0% { background-position:-600px 0; } 100% { background-position:600px 0; } }
    @keyframes countUp  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

    /* ── Root ── */
    .gr-root {
      font-family: ${T.sans};
      color: ${T.ink};
      min-height: 100vh;
      background: ${T.bg};
      padding: 2.5rem 2.25rem 5rem;
    }
    .gr-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .gr-root ::-webkit-scrollbar-track { background: transparent; }
    .gr-root ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 99px; }

    /* ── Page Header ── */
    .ph-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1.25rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid ${T.ink};
      animation: fadeUp 0.3s ease both;
    }
    .ph-kicker {
      font-family: ${T.mono};
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      margin-bottom: 0.45rem;
    }
    .ph-title {
      font-family: ${T.font};
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      color: ${T.ink};
      line-height: 1.05;
    }
    .ph-sub {
      font-size: 0.8rem;
      color: ${T.inkLight};
      margin-top: 0.4rem;
    }

    /* ── Summary Stats Strip ── */
    .stats-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 1px;
      background: ${T.border};
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      margin-bottom: 2rem;
      animation: fadeUp 0.35s ease 0.05s both;
    }
    .stat-cell {
      background: ${T.white};
      padding: 1.1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      transition: background 0.15s ease;
    }
    .stat-cell:hover { background: ${T.bg}; }
    .stat-cell-label {
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${T.inkFaint};
    }
    .stat-cell-value {
      font-family: ${T.mono};
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.04em;
      line-height: 1;
      animation: countUp 0.4s ease both;
    }
    .stat-cell-sub {
      font-size: 0.68rem;
      color: ${T.inkLight};
      margin-top: 0.1rem;
    }

    /* ── Section Divider ── */
    .section-divider {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1rem;
      animation: fadeUp 0.35s ease 0.1s both;
    }
    .section-divider-label {
      font-family: ${T.mono};
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      white-space: nowrap;
    }
    .section-divider-line { flex: 1; height: 1px; background: ${T.border}; }

    /* ── Table wrapper ── */
    .grades-table-wrap {
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      animation: fadeUp 0.4s ease 0.12s both;
    }
    .grades-table-scroll { overflow-x: auto; }

    /* ── Table ── */
    .grades-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.835rem;
    }
    .grades-table thead {
      background: ${T.surfaceAlt};
      border-bottom: 1px solid ${T.border};
    }
    .grades-table thead th {
      padding: 0.75rem 1.1rem;
      text-align: left;
      font-family: ${T.mono};
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      white-space: nowrap;
    }
    .grades-table thead th:first-child { padding-left: 1.4rem; }
    .grades-table thead th:last-child  { padding-right: 1.4rem; text-align: right; }

    .grades-table tbody tr {
      background: ${T.white};
      border-bottom: 1px solid ${T.border};
      transition: background 0.12s ease;
    }
    .grades-table tbody tr:last-child { border-bottom: none; }
    .grades-table tbody tr:hover { background: ${T.bg}; }

    .grades-table tbody td {
      padding: 1rem 1.1rem;
      color: ${T.inkMid};
      vertical-align: middle;
    }
    .grades-table tbody td:first-child {
      padding-left: 1.4rem;
      font-weight: 600;
      color: ${T.ink};
      max-width: 240px;
    }
    .grades-table tbody td:last-child {
      padding-right: 1.4rem;
      text-align: right;
      font-family: ${T.mono};
      font-size: 0.72rem;
      color: ${T.inkFaint};
    }

    /* ── Grade pill ── */
    .grade-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      font-family: ${T.mono};
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 2px;
      border: 1px solid;
      letter-spacing: 0.06em;
    }
    .grade-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* ── Score display ── */
    .score-display {
      font-family: ${T.mono};
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .score-total { color: ${T.inkFaint}; font-weight: 400; }

    /* ── Progress bar ── */
    .pct-bar-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .pct-bar-track {
      flex: 1;
      height: 5px;
      background: ${T.border};
      border-radius: 99px;
      overflow: hidden;
      min-width: 50px;
    }
    .pct-bar-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.5s ease;
    }
    .pct-label {
      font-family: ${T.mono};
      font-size: 0.68rem;
      font-weight: 600;
      color: ${T.inkLight};
      white-space: nowrap;
      min-width: 36px;
      text-align: right;
    }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.18rem 0.55rem;
      border-radius: 2px;
      white-space: nowrap;
      border: 1px solid;
    }
    .badge-assessment { background: ${T.terraDim};  color: ${T.terra};  border-color: ${T.terraBrd};  }
    .badge-homework   { background: ${T.indigoDim}; color: ${T.indigo}; border-color: ${T.indigoBrd}; }
    .badge-graded     { background: ${T.greenDim};  color: ${T.green};  border-color: ${T.greenBrd};  }
    .badge-submitted  { background: ${T.cyanDim};   color: ${T.cyan};   border-color: ${T.cyanBrd};   }
    .badge-pending    { background: ${T.amberDim};  color: ${T.amber};  border-color: ${T.amberBrd};  }

    /* ── Empty state ── */
    .empty-state {
      padding: 5rem 2rem;
      text-align: center;
      background: ${T.white};
    }
    .empty-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      opacity: 0.3;
    }
    .empty-title {
      font-family: ${T.font};
      font-size: 1.1rem;
      font-weight: 700;
      color: ${T.inkMid};
      letter-spacing: -0.02em;
      margin-bottom: 0.4rem;
    }
    .empty-sub {
      font-size: 0.8rem;
      color: ${T.inkFaint};
      line-height: 1.6;
    }

    /* ── Skeleton ── */
    .skel {
      border-radius: ${T.rMd};
      background: linear-gradient(90deg, ${T.border} 25%, ${T.surfaceAlt} 50%, ${T.border} 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// GRADE HELPERS
// ─────────────────────────────────────────────────────────────
const getPct = (score, total) => (total ? Math.round((score / total) * 100) : 0);

const getGrade = (pct) => {
  if (pct >= 90) return { label: 'A+', color: T.green,  bg: T.greenDim,  border: T.greenBrd  };
  if (pct >= 80) return { label: 'A',  color: T.cyan,   bg: T.cyanDim,   border: T.cyanBrd   };
  if (pct >= 70) return { label: 'B',  color: T.indigo, bg: T.indigoDim, border: T.indigoBrd };
  if (pct >= 60) return { label: 'C',  color: T.amber,  bg: T.amberDim,  border: T.amberBrd  };
  return           { label: 'F',  color: T.red,   bg: T.redDim,    border: T.redBrd    };
};

const getBarColor = (pct) => {
  if (pct >= 80) return T.green;
  if (pct >= 60) return T.indigo;
  if (pct >= 40) return T.amber;
  return T.red;
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const Grades = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    studentAPI.getGrades()
      .then(({ data }) => setSubmissions(data.submissions))
      .catch(() => toast.error('Failed to load grades'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived summary stats ──────────────────────────────────
  const gradedSubmissions = submissions.filter(
    (s) => s.totalScore != null && s.assignment?.totalMarks
  );
  const avgPct = gradedSubmissions.length
    ? Math.round(
        gradedSubmissions.reduce(
          (sum, s) => sum + getPct(s.totalScore, s.assignment.totalMarks), 0
        ) / gradedSubmissions.length
      )
    : null;
  const best = gradedSubmissions.reduce((top, s) => {
    const pct = getPct(s.totalScore, s.assignment.totalMarks);
    return pct > (top?.pct ?? -1) ? { ...s, pct } : top;
  }, null);
  const avgGrade = avgPct != null ? getGrade(avgPct) : null;

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="gr-root">
          <GlobalStyles />
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="skel" style={{ height: 72 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '1px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skel" style={{ height: 76 }} />
              ))}
            </div>
            <div className="skel" style={{ height: 360, borderRadius: '12px' }} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="gr-root">
        <GlobalStyles />

        {/* ── Page header ── */}
        <div className="ph-row">
          <div>
            <div className="ph-kicker">Student Portal</div>
            <h1 className="ph-title">Grade History</h1>
            <p className="ph-sub">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} on record
            </p>
          </div>
          {avgGrade && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem'
            }}>
              <div style={{
                fontFamily: T.mono, fontSize: '0.58rem', fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkFaint
              }}>
                Overall Average
              </div>
              <div style={{
                fontFamily: T.mono, fontSize: '2rem', fontWeight: 700,
                letterSpacing: '-0.04em', color: avgGrade.color, lineHeight: 1
              }}>
                {avgGrade.label}
                <span style={{ fontSize: '1rem', color: T.inkFaint, marginLeft: '0.35rem' }}>
                  {avgPct}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Summary stats strip ── */}
        {submissions.length > 0 && (
          <div className="stats-strip">
            <div className="stat-cell">
              <div className="stat-cell-label">Submissions</div>
              <div className="stat-cell-value" style={{ color: T.ink }}>{submissions.length}</div>
              <div className="stat-cell-sub">total</div>
            </div>
            <div className="stat-cell">
              <div className="stat-cell-label">Average</div>
              <div className="stat-cell-value" style={{ color: avgGrade?.color ?? T.inkMid }}>
                {avgPct != null ? `${avgPct}%` : '—'}
              </div>
              <div className="stat-cell-sub">{avgGrade?.label ?? '—'}</div>
            </div>
            <div className="stat-cell">
              <div className="stat-cell-label">Best Score</div>
              <div className="stat-cell-value" style={{ color: T.green }}>
                {best ? `${best.pct}%` : '—'}
              </div>
              <div className="stat-cell-sub" style={{
                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {best?.assignment?.title ?? '—'}
              </div>
            </div>
            <div className="stat-cell">
              <div className="stat-cell-label">Graded</div>
              <div className="stat-cell-value" style={{ color: T.ink }}>{gradedSubmissions.length}</div>
              <div className="stat-cell-sub">of {submissions.length}</div>
            </div>
          </div>
        )}

        {/* ── Section label ── */}
        <div className="section-divider">
          <span className="section-divider-label">Submission Records</span>
          <div className="section-divider-line" />
        </div>

        {/* ── Table ── */}
        <div className="grades-table-wrap">
          {submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◻</div>
              <div className="empty-title">No grades yet</div>
              <div className="empty-sub">Submit an assignment to see your score here.</div>
            </div>
          ) : (
            <div className="grades-table-scroll">
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Performance</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, idx) => {
                    const pct   = getPct(s.totalScore, s.assignment?.totalMarks);
                    const grade = getGrade(pct);
                    const bar   = getBarColor(pct);
                    const hasScore = s.totalScore != null && s.assignment?.totalMarks;

                    return (
                      <tr key={s._id} style={{ animationDelay: `${idx * 0.03}s` }}>

                        {/* Assignment title */}
                        <td>{s.assignment?.title || '—'}</td>

                        {/* Type badge */}
                        <td>
                          <span className={`badge badge-${s.assignment?.type}`}>
                            {s.assignment?.type || '—'}
                          </span>
                        </td>

                        {/* Raw score */}
                        <td>
                          {hasScore ? (
                            <span className="score-display">
                              {s.totalScore}
                              <span className="score-total"> / {s.assignment.totalMarks}</span>
                            </span>
                          ) : (
                            <span style={{ color: T.inkFaint, fontFamily: T.mono, fontSize: '0.72rem' }}>—</span>
                          )}
                        </td>

                        {/* Progress bar */}
                        <td style={{ minWidth: 120 }}>
                          {hasScore ? (
                            <div className="pct-bar-wrap">
                              <div className="pct-bar-track">
                                <div
                                  className="pct-bar-fill"
                                  style={{ width: `${pct}%`, background: bar }}
                                />
                              </div>
                              <span className="pct-label">{pct}%</span>
                            </div>
                          ) : (
                            <span style={{ color: T.inkFaint, fontFamily: T.mono, fontSize: '0.72rem' }}>—</span>
                          )}
                        </td>

                        {/* Grade pill */}
                        <td>
                          {hasScore ? (
                            <span className="grade-pill" style={{
                              color: grade.color,
                              background: grade.bg,
                              borderColor: grade.border,
                            }}>
                              <span className="grade-dot" style={{ background: grade.color }} />
                              {grade.label}
                            </span>
                          ) : (
                            <span style={{ color: T.inkFaint, fontFamily: T.mono, fontSize: '0.72rem' }}>—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge badge-${s.status}`}>
                            {s.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td>
                          {new Date(s.submittedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Grades;