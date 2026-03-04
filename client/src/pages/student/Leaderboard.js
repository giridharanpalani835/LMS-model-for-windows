// pages/student/Leaderboard.js — Global student rankings
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { leaderboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS — Udemy palette
// #5624d0 purple  |  #1c1d1f ink  |  #f7f9fa bg  |  #d1d7dc border
// ─────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  bg:         '#f7f9fa',
  white:      '#ffffff',
  surfaceAlt: '#f0f4f8',
  border:     '#d1d7dc',
  borderMid:  '#b4bcc4',

  // Ink
  ink:        '#1c1d1f',
  inkMid:     '#3d4045',
  inkLight:   '#6a6f73',
  inkFaint:   '#9da3a8',

  // Udemy Purple
  purple:     '#5624d0',
  purpleMid:  '#4527a0',
  purpleDim:  '#f0ebff',
  purpleBrd:  '#c4b5fd',

  // Secondary
  green:      '#1e6f42',
  greenDim:   '#e6f4ec',
  greenBrd:   '#a3cfb8',
  red:        '#c0392b',
  redDim:     '#fdecea',
  redBrd:     '#f5b7b1',

  // Medal tiers
  gold:       '#7d5f00',
  goldBg:     '#fffaeb',
  goldBrd:    'rgb(246, 223, 14)',
  silver:     '#374151',
  silverBg:   '#f9fafb',
  silverBrd:  '#d1d5db',
  bronze:     '#6b3a1f',
  bronzeBg:   '#fff4ec',
  bronzeBrd:  '#f4a261',

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
    @keyframes growBar { from { width:0; } }

    /* ── Root ── */
    .lb-root {
      font-family: ${T.sans};
      color: ${T.ink};
      min-height: 100vh;
      background: ${T.bg};
      padding: 2.25rem 2.25rem 5rem;
    }
    .lb-root ::-webkit-scrollbar { width: 4px; }
    .lb-root ::-webkit-scrollbar-track { background: transparent; }
    .lb-root ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 99px; }

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
    .ph-count {
      font-family: ${T.mono};
      font-size: 0.68rem;
      color: ${T.inkFaint};
      letter-spacing: 0.06em;
      align-self: flex-end;
      padding: 0.3rem 0.75rem;
      background: ${T.white};
      border: 1px solid ${T.border};
      border-radius: ${T.rSm};
    }

    /* ── My Rank Card ── */
    .my-rank-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
      background: ${T.purpleDim};
      border: 1px solid ${T.purpleBrd};
      border-left: 4px solid ${T.purple};
      border-radius: ${T.rMd};
      padding: 1rem 1.4rem;
      margin-bottom: 1.75rem;
      animation: fadeUp 0.35s ease 0.05s both;
    }
    .my-rank-position {
      font-family: ${T.mono};
      font-size: 1.9rem;
      font-weight: 700;
      letter-spacing: -0.05em;
      color: ${T.purple};
      line-height: 1;
      flex-shrink: 0;
    }
    .my-rank-divider {
      width: 1px;
      height: 38px;
      background: ${T.purpleBrd};
      flex-shrink: 0;
    }
    .my-rank-label {
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: ${T.purple};
      opacity: 0.65;
      margin-bottom: 0.2rem;
    }
    .my-rank-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: ${T.purple};
      margin-bottom: 0.15rem;
    }
    .my-rank-meta {
      font-family: ${T.mono};
      font-size: 0.68rem;
      color: ${T.inkLight};
      letter-spacing: 0.02em;
    }

    /* ── Section Divider ── */
    .section-divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.9rem;
      animation: fadeUp 0.35s ease 0.1s both;
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

    /* ── Leaderboard list ── */
    .lb-list {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: ${T.border};
      border: 1px solid ${T.border};
      border-radius: ${T.rLg};
      overflow: hidden;
      animation: fadeUp 0.4s ease 0.12s both;
    }

    /* ── Row ── */
    .lb-row {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.85rem 1.4rem;
      background: ${T.white};
      transition: background 0.12s ease;
      animation: slideIn 0.3s ease both;
    }
    .lb-row:hover { background: ${T.bg}; }

    .lb-row.is-me {
      background: ${T.purpleDim};
      border-left: 3px solid ${T.purple};
      padding-left: calc(1.4rem - 3px);
    }
    .lb-row.is-me:hover { background: #e5deff; }

    .lb-row.rank-1         { background: ${T.goldBg}; }
    .lb-row.rank-1:hover   { background: #fef8d0; }
    .lb-row.rank-2         { background: ${T.silverBg}; }
    .lb-row.rank-2:hover   { background: #f0f2f5; }
    .lb-row.rank-3         { background: ${T.bronzeBg}; }
    .lb-row.rank-3:hover   { background: #fff0e4; }
    .lb-row.rank-1 .lb-name,
    .lb-row.rank-2 .lb-name,
    .lb-row.rank-3 .lb-name { font-weight: 700; }

    .lb-row:nth-child(1)  { animation-delay:0.04s }
    .lb-row:nth-child(2)  { animation-delay:0.07s }
    .lb-row:nth-child(3)  { animation-delay:0.10s }
    .lb-row:nth-child(4)  { animation-delay:0.13s }
    .lb-row:nth-child(5)  { animation-delay:0.16s }
    .lb-row:nth-child(6)  { animation-delay:0.19s }
    .lb-row:nth-child(7)  { animation-delay:0.22s }
    .lb-row:nth-child(8)  { animation-delay:0.25s }
    .lb-row:nth-child(9)  { animation-delay:0.28s }
    .lb-row:nth-child(10) { animation-delay:0.31s }

    /* ── Rank col ── */
    .lb-rank-col {
      width: 42px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .lb-rank-num {
      font-family: ${T.mono};
      font-size: 0.7rem;
      font-weight: 600;
      color: ${T.inkFaint};
      letter-spacing: 0.04em;
    }

    /* Medal chips */
    .lb-medal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: ${T.rSm};
      font-family: ${T.mono};
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      border: 1.5px solid;
    }
    .lb-medal.gold   { background:${T.goldBg};   color:${T.gold};   border-color:${T.goldBrd};   }
    .lb-medal.silver { background:${T.silverBg}; color:${T.silver}; border-color:${T.silverBrd}; }
    .lb-medal.bronze { background:${T.bronzeBg}; color:${T.bronze}; border-color:${T.bronzeBrd}; }

    /* ── Avatar ── */
    .lb-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${T.surfaceAlt};
      border: 1.5px solid ${T.border};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${T.mono};
      font-size: 0.75rem;
      font-weight: 700;
      color: ${T.inkLight};
      flex-shrink: 0;
      text-transform: uppercase;
    }
    .lb-row.is-me .lb-avatar {
      background: ${T.purpleBrd};
      border-color: ${T.purple};
      color: ${T.purple};
    }

    /* ── Info ── */
    .lb-info { flex: 1; min-width: 0; }
    .lb-name-row {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-bottom: 0.15rem;
      flex-wrap: wrap;
    }
    .lb-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: ${T.ink};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lb-row.is-me .lb-name { color: ${T.purple}; }

    /* "You" tag — Udemy purple filled */
    .you-tag {
      display: inline-flex;
      align-items: center;
      font-family: ${T.mono};
      font-size: 0.52rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${T.white};
      background: ${T.purple};
      padding: 0.12rem 0.45rem;
      border-radius: ${T.rSm};
      flex-shrink: 0;
    }

    /* Student badge — neutral gray */
    .student-badge {
      display: inline-flex;
      align-items: center;
      font-family: ${T.mono};
      font-size: 0.52rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      background: ${T.surfaceAlt};
      border: 1px solid ${T.border};
      padding: 0.12rem 0.45rem;
      border-radius: ${T.rSm};
      flex-shrink: 0;
    }

    .lb-subs {
      font-family: ${T.mono};
      font-size: 0.67rem;
      color: ${T.inkFaint};
      letter-spacing: 0.02em;
    }

    /* ── Score bar ── */
    .score-bar-wrap {
      width: 80px;
      flex-shrink: 0;
    }
    .score-bar-track {
      width: 100%;
      height: 4px;
      background: ${T.border};
      border-radius: 99px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      border-radius: 99px;
      animation: growBar 0.7s ease both;
    }

    /* ── Score col ── */
    .lb-score-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-shrink: 0;
      min-width: 52px;
    }
    .lb-score-num {
      font-family: ${T.mono};
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: ${T.ink};
      line-height: 1;
    }
    .lb-row.is-me .lb-score-num { color: ${T.purple}; }
    .lb-score-label {
      font-family: ${T.mono};
      font-size: 0.56rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${T.inkFaint};
      margin-top: 0.1rem;
    }

    /* ── Empty ── */
    .empty-state {
      padding: 5rem 2rem;
      text-align: center;
      background: ${T.white};
    }
    .empty-icon  { font-size: 2.5rem; opacity: 0.2; margin-bottom: 1rem; }
    .empty-title {
      font-family: ${T.font};
      font-size: 1.1rem; font-weight: 700;
      color: ${T.inkMid}; letter-spacing: -0.02em; margin-bottom: 0.4rem;
    }
    .empty-sub { font-size: 0.8rem; color: ${T.inkFaint}; line-height: 1.65; }

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
// MEDAL CHIP
// ─────────────────────────────────────────────────────────────
const MedalChip = ({ rank }) => {
  const tiers = [
    { cls: 'gold',   label: '1ST' },
    { cls: 'silver', label: '2ND' },
    { cls: 'bronze', label: '3RD' },
  ];
  return <span className={`lb-medal ${tiers[rank].cls}`}>{tiers[rank].label}</span>;
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const Leaderboard = () => {
  const { user }              = useAuth();
  const [board, setBoard]     = useState([]);
  const [myRank, setMyRank]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([leaderboardAPI.get(50), leaderboardAPI.getMyRank()])
      .then(([{ data: lb }, { data: me }]) => {
        setBoard(lb.leaderboard);
        setMyRank(me.entry);
      })
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  const maxScore = board.length ? Math.max(...board.map((e) => e.totalScore || 0)) : 1;

  // ── Skeleton ──────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="lb-root">
          <GlobalStyles />
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div className="skel" style={{ height: 70 }} />
            <div className="skel" style={{ height: 68 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skel" style={{
                  height: 60,
                  borderRadius: i === 0 ? '12px 12px 0 0' : i === 7 ? '0 0 12px 12px' : 0
                }} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="lb-root">
        <GlobalStyles />

        {/* ── Page header ── */}
        <div className="ph-row">
          <div>
            <div className="ph-kicker">Student Portal</div>
            <h1 className="ph-title">Leaderboard</h1>
            <p className="ph-sub">Top performers this semester</p>
          </div>
          <div className="ph-count">{board.length} students ranked</div>
        </div>

        {/* ── My rank card ── */}
        {myRank && (
          <div className="my-rank-card">
            <div className="my-rank-position">#{myRank.rank}</div>
            <div className="my-rank-divider" />
            <div>
              <div className="my-rank-label">Your Ranking</div>
              <div className="my-rank-name">{user?.name}</div>
              <div className="my-rank-meta">
                {myRank.totalScore} pts · {myRank.submissionsCount} submission{myRank.submissionsCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* ── Section label ── */}
        <div className="section-divider">
          <span className="section-divider-label">Rankings</span>
          <div className="section-divider-line" />
        </div>

        {/* ── List ── */}
        <div className="lb-list">
          {board.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◻</div>
              <div className="empty-title">No rankings yet</div>
              <div className="empty-sub">
                Scores will appear here once assignments are submitted.
              </div>
            </div>
          ) : (
            board.map((entry, i) => {
              const isMe     = entry.student?._id === user?._id;
              const isTop3   = i < 3;
              const rankCls  = isTop3 ? `rank-${i + 1}` : '';
              const initials = entry.student?.name?.slice(0, 2) ?? '??';
              const barPct   = maxScore ? Math.round((entry.totalScore / maxScore) * 100) : 0;
              const barColor = isMe
                ? T.purple
                : i === 0 ? T.goldBrd
                : i === 1 ? T.silverBrd
                : i === 2 ? T.bronzeBrd
                : T.borderMid;

              return (
                <div
                  key={entry._id}
                  className={`lb-row ${rankCls} ${isMe ? 'is-me' : ''}`}
                >
                  {/* Rank */}
                  <div className="lb-rank-col">
                    {isTop3
                      ? <MedalChip rank={i} />
                      : <span className="lb-rank-num">#{entry.rank}</span>
                    }
                  </div>

                  {/* Avatar */}
                  <div className="lb-avatar">{initials}</div>

                  {/* Info */}
                  <div className="lb-info">
                    <div className="lb-name-row">
                      <span className="lb-name">{entry.student?.name}</span>
                      {isMe && <span className="you-tag">You</span>}
                      <span className="student-badge">Student</span>
                    </div>
                    <div className="lb-subs">
                      {entry.submissionsCount} submission{entry.submissionsCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="score-bar-wrap">
                    <div className="score-bar-track">
                      <div
                        className="score-bar-fill"
                        style={{ width: `${barPct}%`, background: barColor }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="lb-score-col">
                    <span className="lb-score-num">{entry.totalScore}</span>
                    <span className="lb-score-label">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;