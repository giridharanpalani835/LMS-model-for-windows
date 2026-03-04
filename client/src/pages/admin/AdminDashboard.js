// pages/admin/AdminDashboard.js — System-wide overview
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import RoleChart from '../../components/charts/RoleChart';
import PerformanceChart from '../../components/charts/PerformanceChart';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Inline styles — scoped to this page only.
   Move to a .module.css / Tailwind layer if
   your project has a preferred convention.
───────────────────────────────────────────── */
const styles = {
  /* Layout shell */
  wrapper: {
    padding: '2.5rem 2rem',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    color: '#e2e8f0',
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0b0f1a 0%, #0f1623 60%, #111827 100%)',
  },

  /* ── Header ── */
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: '2.5rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  headerLeft: {},
  eyebrow: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#38bdf8',
    marginBottom: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#38bdf8',
    animation: 'pulse 2s infinite',
    display: 'inline-block',
  },
  pageTitle: {
    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.03em',
    color: '#f1f5f9',
    lineHeight: 1.15,
  },
  pageSub: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0.35rem 0 0',
    fontWeight: 400,
  },
  timestamp: {
    fontSize: '0.75rem',
    color: '#334155',
    padding: '0.4rem 0.75rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '0.375rem',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-start',
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0.04) 60%, transparent 100%)',
    marginBottom: '2rem',
    border: 'none',
  },

  /* ── Stats grid ── */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },

  /* ── Stat card ── */
  statCard: (accent) => ({
    background: 'rgba(15, 22, 36, 0.8)',
    border: `1px solid rgba(255,255,255,0.07)`,
    borderRadius: '0.75rem',
    padding: '1.25rem 1.4rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    cursor: 'default',
    backdropFilter: 'blur(8px)',
  }),
  statCardAccentBar: (accent) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, ${accent} 0%, transparent 80%)`,
    borderRadius: '0.75rem 0.75rem 0 0',
  }),
  statCardGlow: (accent) => ({
    position: 'absolute',
    top: -30,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: accent,
    opacity: 0.06,
    filter: 'blur(20px)',
    pointerEvents: 'none',
  }),
  statIcon: {
    fontSize: '1.4rem',
    marginBottom: '0.85rem',
    display: 'block',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: '0.3rem',
  },
  statValue: (accent) => ({
    fontSize: '2rem',
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.04em',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  }),

  /* ── Charts row ── */
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1rem',
  },
  chartCard: {
    background: 'rgba(15, 22, 36, 0.8)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    backdropFilter: 'blur(8px)',
    position: 'relative',
    overflow: 'hidden',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  chartTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#94a3b8',
    margin: 0,
  },
  chartBadge: {
    fontSize: '0.65rem',
    fontWeight: 600,
    padding: '0.2rem 0.55rem',
    borderRadius: '999px',
    background: 'rgba(56,189,248,0.1)',
    color: '#38bdf8',
    border: '1px solid rgba(56,189,248,0.2)',
    letterSpacing: '0.06em',
  },

  /* ── Section label ── */
  sectionLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#334155',
    marginBottom: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: 'rgba(255,255,255,0.05)',
  },

  /* ── Loading skeleton ── */
  skeleton: {
    display: 'grid',
    gap: '1rem',
  },
  skeletonBar: (w = '100%', h = '80px') => ({
    width: w,
    height: h,
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.04)',
    animation: 'shimmer 1.6s infinite linear',
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
    backgroundSize: '200% 100%',
  }),
};

/* ── Keyframes injected once ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .admin-stat-card {
      animation: fadeUp 0.4s ease both;
    }
    .admin-stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      border-color: rgba(255,255,255,0.12) !important;
    }
    .admin-chart-card {
      animation: fadeUp 0.5s ease both;
    }

    /* Stagger children */
    .admin-stat-card:nth-child(1) { animation-delay: 0.05s; }
    .admin-stat-card:nth-child(2) { animation-delay: 0.10s; }
    .admin-stat-card:nth-child(3) { animation-delay: 0.15s; }
    .admin-stat-card:nth-child(4) { animation-delay: 0.20s; }
    .admin-stat-card:nth-child(5) { animation-delay: 0.25s; }
    .admin-chart-card:nth-child(1) { animation-delay: 0.30s; }
    .admin-chart-card:nth-child(2) { animation-delay: 0.38s; }
  `}</style>
);

/* ── Inline StatCard ─────────────────────────────── */
const DashStatCard = ({ icon, label, value, accent = '#38bdf8' }) => (
  <div className="admin-stat-card" style={styles.statCard(accent)}>
    <div style={styles.statCardAccentBar(accent)} />
    <div style={styles.statCardGlow(accent)} />
    <span style={styles.statIcon}>{icon}</span>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue(accent)}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
  </div>
);

/* ── Skeleton loader ─────────────────────────────── */
const LoadingSkeleton = () => (
  <div style={styles.skeleton}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {[...Array(5)].map((_, i) => <div key={i} style={styles.skeletonBar('100%', '110px')} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div style={styles.skeletonBar('100%', '280px')} />
      <div style={styles.skeletonBar('100%', '280px')} />
    </div>
  </div>
);

/* ────────────────────────────────────────────────── */
/*  Main component                                    */
/* ────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getOverview()
      .then(({ data }) => setOverview(data))
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setLoading(false));
  }, []);

  /** Group submissions by calendar day for the line chart */
  const submissionsByDay = () => {
    if (!overview?.recentSubmissions) return { labels: [], data: [] };
    const map = {};
    overview.recentSubmissions.forEach((s) => {
      const day = new Date(s.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      map[day] = (map[day] || 0) + 1;
    });
    return { labels: Object.keys(map), data: Object.values(map) };
  };

  const sbDay = submissionsByDay();

  const adminCount =
    overview && overview.totalUsers != null
      ? overview.totalUsers - (overview.students ?? 0) - (overview.teachers ?? 0)
      : 0;

  const now = new Date().toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <DashboardLayout>
      <GlobalStyles />

      <div style={styles.wrapper}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowDot} />
              Admin Console
            </div>
            <h1 style={styles.pageTitle}>System Overview</h1>
            <p style={styles.pageSub}>Platform-wide analytics and management</p>
          </div>
          <div style={styles.timestamp}>🕐 {now}</div>
        </div>

        <hr style={styles.divider} />

        {/* ── Content ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* ── Section label ── */}
            <div style={styles.sectionLabel}>
              Key Metrics
              <div style={styles.sectionLine} />
            </div>

            {/* ── Stats ── */}
            <div style={styles.statsGrid}>
              <DashStatCard
                icon="👥"
                label="Total Users"
                value={overview?.totalUsers ?? 0}
                accent="#38bdf8"
              />
              <DashStatCard
                icon="🎓"
                label="Students"
                value={overview?.students ?? 0}
                accent="#4ade80"
              />
              <DashStatCard
                icon="📚"
                label="Teachers"
                value={overview?.teachers ?? 0}
                accent="#a78bfa"
              />
              <DashStatCard
                icon="📝"
                label="Assignments"
                value={overview?.totalAssignments ?? 0}
                accent="#fb923c"
              />
              <DashStatCard
                icon="📬"
                label="Submissions"
                value={overview?.totalSubmissions ?? 0}
                accent="#f87171"
              />
            </div>

            {/* ── Section label ── */}
            <div style={{ ...styles.sectionLabel, marginTop: '0.5rem' }}>
              Analytics
              <div style={styles.sectionLine} />
            </div>

            {/* ── Charts ── */}
            <div style={styles.chartsRow}>
              {/* User Distribution */}
              <div className="admin-chart-card" style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h3 style={styles.chartTitle}>User Distribution</h3>
                  <span style={styles.chartBadge}>All time</span>
                </div>
                <RoleChart
                  students={overview?.students}
                  teachers={overview?.teachers}
                  admins={adminCount}
                />
              </div>

              {/* Submissions trend */}
              <div className="admin-chart-card" style={styles.chartCard}>
                <div style={styles.chartHeader}>
                  <h3 style={styles.chartTitle}>Submission Activity</h3>
                  <span style={styles.chartBadge}>Last 7 days</span>
                </div>
                <PerformanceChart
                  labels={sbDay.labels}
                  scores={sbDay.data}
                  label="Submissions"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;