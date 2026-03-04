// pages/teacher/Performance.js — Student performance analytics + export
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import PerformanceChart from '../../components/charts/PerformanceChart';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — Udemy palette
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
    @keyframes slideIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }

    /* ── Root ── */
    .pf-root {
      font-family: ${T.sans};
      color: ${T.ink};
      min-height: 100vh;
      background: ${T.bg};
      padding: 2.25rem 2.25rem 5rem;
    }
    .pf-root ::-webkit-scrollbar { width: 4px; height: 4px; }
    .pf-root ::-webkit-scrollbar-track { background: transparent; }
    .pf-root ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 99px; }

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
    .ph-sub {
      font-size: 0.82rem;
      color: ${T.inkLight};
      margin-top: 0.35rem;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-family: ${T.sans};
      font-weight: 700;
      font-size: 0.8rem;
      border: none;
      border-radius: ${T.rSm};
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
      outline: none;
      letter-spacing: 0.01em;
    }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-primary {
      background: ${T.purple};
      color: ${T.white};
      padding: 0.6rem 1.2rem;
    }
    .btn-primary:not(:disabled):hover {
      background: ${T.purpleMid};
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(86,36,208,0.3);
    }
    .btn-ghost {
      background: ${T.white};
      color: ${T.inkMid};
      border: 1.5px solid ${T.border};
      padding: 0.6rem 1.1rem;
    }
    .btn-ghost:not(:disabled):hover { border-color: ${T.inkMid}; background: ${T.bg}; }

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

    /* ── Chart Card ── */
    .chart-card {
      background: ${T.white};
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      margin-bottom: 2rem;
      animation: fadeUp 0.4s ease 0.08s both;
    }
    .chart-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.4rem;
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

    /* ── Performance Sections ── */
    .perf-section {
      background: ${T.white};
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      margin-bottom: 1rem;
      animation: fadeUp 0.4s ease both;
    }
    .perf-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 1rem 1.4rem;
      background: ${T.surfaceAlt};
      border-bottom: 1px solid ${T.border};
    }
    .perf-section-left { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
    .perf-section-title {
      font-family: ${T.font};
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: ${T.ink};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .perf-meta-chips {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .perf-chip {
      display: inline-flex;
      align-items: center;
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      padding: 0.2rem 0.55rem;
      border-radius: ${T.rSm};
      border: 1px solid;
      white-space: nowrap;
    }
    .perf-chip.avg  { color: ${T.purple}; background: ${T.purpleDim}; border-color: ${T.purpleBrd}; }
    .perf-chip.subs { color: ${T.inkLight}; background: ${T.surfaceAlt}; border-color: ${T.border}; }

    /* ── Avg Score Bar ── */
    .avg-bar-wrap {
      padding: 0.9rem 1.4rem;
      border-bottom: 1px solid ${T.border};
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .avg-bar-label {
      font-family: ${T.mono};
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      white-space: nowrap;
    }
    .avg-bar-track {
      flex: 1;
      height: 6px;
      background: ${T.border};
      border-radius: 99px;
      overflow: hidden;
    }
    .avg-bar-fill {
      height: 100%;
      border-radius: 99px;
      background: ${T.purple};
      transition: width 0.6s ease;
    }
    .avg-bar-pct {
      font-family: ${T.mono};
      font-size: 0.68rem;
      font-weight: 700;
      color: ${T.purple};
      white-space: nowrap;
      min-width: 36px;
      text-align: right;
    }

    /* ── Table ── */
    .table-scroll { overflow-x: auto; }
    .perf-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.835rem;
    }
    .perf-table thead {
      background: ${T.bg};
      border-bottom: 1px solid ${T.border};
    }
    .perf-table thead th {
      padding: 0.65rem 1.1rem;
      text-align: left;
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      white-space: nowrap;
    }
    .perf-table thead th:first-child { padding-left: 1.4rem; }
    .perf-table thead th:last-child  { padding-right: 1.4rem; text-align: right; }

    .perf-table tbody tr {
      background: ${T.white};
      border-bottom: 1px solid ${T.border};
      transition: background 0.12s ease;
    }
    .perf-table tbody tr:last-child { border-bottom: none; }
    .perf-table tbody tr:hover { background: ${T.bg}; }

    .perf-table tbody td {
      padding: 0.85rem 1.1rem;
      color: ${T.inkMid};
      vertical-align: middle;
    }
    .perf-table tbody td:first-child { padding-left: 1.4rem; font-weight: 600; color: ${T.ink}; }
    .perf-table tbody td:last-child  { padding-right: 1.4rem; text-align: right; font-family: ${T.mono}; font-size: 0.72rem; color: ${T.inkFaint}; }

    /* ── Score display ── */
    .score-display {
      font-family: ${T.mono};
      font-size: 0.82rem;
      font-weight: 700;
      color: ${T.ink};
    }
    .score-total { color: ${T.inkFaint}; font-weight: 400; }

    /* ── Row score bar ── */
    .row-bar-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 90px;
    }
    .row-bar-track {
      flex: 1;
      height: 4px;
      background: ${T.border};
      border-radius: 99px;
      overflow: hidden;
    }
    .row-bar-fill {
      height: 100%;
      border-radius: 99px;
    }

    /* ── Student avatar initial ── */
    .student-initial {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: ${T.purpleDim};
      border: 1px solid ${T.purpleBrd};
      font-family: ${T.mono};
      font-size: 0.6rem;
      font-weight: 700;
      color: ${T.purple};
      text-transform: uppercase;
      flex-shrink: 0;
      margin-right: 0.5rem;
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
      border-radius: ${T.rSm};
      white-space: nowrap;
      border: 1px solid;
    }
    .badge-graded    { background: ${T.greenDim}; color: ${T.green}; border-color: ${T.greenBrd}; }
    .badge-submitted { background: ${T.tealDim};  color: ${T.teal};  border-color: ${T.tealBrd};  }
    .badge-pending   { background: ${T.amberDim}; color: ${T.amber}; border-color: ${T.amberBrd}; }

    /* ── Empty ── */
    .empty-state {
      padding: 3rem 2rem;
      text-align: center;
    }
    .empty-icon  { font-size: 2rem; opacity: 0.2; margin-bottom: 0.75rem; }
    .empty-title {
      font-family: ${T.font};
      font-size: 0.95rem; font-weight: 700;
      color: ${T.inkMid}; letter-spacing: -0.02em; margin-bottom: 0.3rem;
    }
    .empty-sub { font-size: 0.78rem; color: ${T.inkFaint}; line-height: 1.6; }

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
// HELPERS
// ─────────────────────────────────────────────────────────────
const getPct = (score, total) => (total ? Math.round((score / total) * 100) : 0);

const getBarColor = (pct) => {
  if (pct >= 80) return T.green;
  if (pct >= 60) return T.purple;
  if (pct >= 40) return T.amber;
  return T.red;
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const Performance = () => {
  const [perf, setPerf]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    teacherAPI.getPerformance()
      .then(({ data }) => setPerf(data.performance))
      .catch(() => toast.error('Failed to load performance data'))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await teacherAPI.exportResults();
      const headers  = Object.keys(data.results[0] || {}).join(',');
      const rows     = data.results.map((r) => Object.values(r).join(','));
      const csv      = [headers, ...rows].join('\n');
      const blob     = new Blob([csv], { type: 'text/csv' });
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement('a');
      a.href         = url;
      a.download     = 'results.csv';
      a.click();
      toast.success('Exported successfully');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // ── Skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="pf-root">
          <GlobalStyles />
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="skel" style={{ height: 72 }} />
            <div className="skel" style={{ height: 300, borderRadius: '12px' }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skel" style={{ height: 220, borderRadius: '12px' }} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pf-root">
        <GlobalStyles />

        {/* ── Page header ── */}
        <div className="ph-row">
          <div>
            <div className="ph-kicker">Teacher Dashboard</div>
            <h1 className="ph-title">Performance Analytics</h1>
            <p className="ph-sub">Average scores and submission breakdown by assignment</p>
          </div>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : '↓ Export CSV'}
          </button>
        </div>

        {/* ── Overview chart ── */}
        <div className="section-divider">
          <span className="section-divider-label">Overview</span>
          <div className="section-divider-line" />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Average Scores by Assignment</div>
            <span className="chart-card-badge">{perf.length} Assignments</span>
          </div>
          <div className="chart-card-body">
            {perf.length > 0 ? (
              <PerformanceChart
                labels={perf.map((p) => p.title)}
                scores={perf.map((p) => parseFloat(p.avgScore))}
              />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">◻</div>
                <div className="empty-title">No data yet</div>
                <div className="empty-sub">Grades will appear once students submit assignments.</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Per-assignment breakdown ── */}
        {perf.length > 0 && (
          <>
            <div className="section-divider" style={{ marginTop: '0.5rem' }}>
              <span className="section-divider-label">Breakdown by Assignment</span>
              <div className="section-divider-line" />
            </div>

            {perf.map((p, sIdx) => {
              const avgNum  = parseFloat(p.avgScore) || 0;
              const maxMark = p.subs?.[0]?.assignment?.totalMarks || 100;
              const avgPct  = Math.round((avgNum / maxMark) * 100);

              return (
                <div
                  key={p.title}
                  className="perf-section"
                  style={{ animationDelay: `${sIdx * 0.06}s` }}
                >
                  {/* Section header */}
                  <div className="perf-section-header">
                    <div className="perf-section-left">
                      <div className="perf-section-title">{p.title}</div>
                    </div>
                    <div className="perf-meta-chips">
                      <span className="perf-chip avg">Avg {p.avgScore} pts</span>
                      <span className="perf-chip subs">{p.submissions} submissions</span>
                    </div>
                  </div>

                  {/* Avg score progress bar */}
                  <div className="avg-bar-wrap">
                    <span className="avg-bar-label">Class Average</span>
                    <div className="avg-bar-track">
                      <div
                        className="avg-bar-fill"
                        style={{ width: `${avgPct}%`, background: getBarColor(avgPct) }}
                      />
                    </div>
                    <span className="avg-bar-pct" style={{ color: getBarColor(avgPct) }}>
                      {avgPct}%
                    </span>
                  </div>

                  {/* Submissions table */}
                  {p.subs?.length > 0 && (
                    <div className="table-scroll">
                      <table className="perf-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Score</th>
                            <th>Performance</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.subs.map((s) => {
                            const pct   = getPct(s.totalScore, s.assignment?.totalMarks);
                            const color = getBarColor(pct);
                            return (
                              <tr key={s._id}>
                                {/* Student */}
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className="student-initial">
                                      {s.student?.name?.charAt(0) ?? '?'}
                                    </span>
                                    {s.student?.name ?? '—'}
                                  </div>
                                </td>

                                {/* Raw score */}
                                <td>
                                  <span className="score-display">
                                    {s.totalScore}
                                    <span className="score-total"> / {s.assignment?.totalMarks}</span>
                                  </span>
                                </td>

                                {/* Bar */}
                                <td>
                                  <div className="row-bar-wrap">
                                    <div className="row-bar-track">
                                      <div
                                        className="row-bar-fill"
                                        style={{ width: `${pct}%`, background: color }}
                                      />
                                    </div>
                                    <span style={{
                                      fontFamily: T.mono, fontSize: '0.65rem',
                                      fontWeight: 700, color, minWidth: 34, textAlign: 'right'
                                    }}>
                                      {pct}%
                                    </span>
                                  </div>
                                </td>

                                {/* Status */}
                                <td>
                                  <span className={`badge badge-${s.status}`}>{s.status}</span>
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
              );
            })}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Performance;