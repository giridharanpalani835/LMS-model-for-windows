// pages/teacher/TeacherDashboard.js — Overview + charts
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import PerformanceChart from '../../components/charts/PerformanceChart';
import { teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap');

  :root {
    --udemy-purple:       #5624d0;
    --udemy-purple-hover: #3d1a9e;
    --udemy-purple-light: #f0e9ff;
    --udemy-dark:         #1c1d1f;
    --udemy-mid:          #3d3d3d;
    --udemy-gray:         #6a6f73;
    --udemy-border:       #d1d7dc;
    --udemy-bg:           #f7f9fa;
    --udemy-white:        #ffffff;
    --udemy-orange:       #f69c08;
    --udemy-orange-light: #fff8e7;
    --udemy-green:        #1e6055;
    --udemy-green-light:  #ecfdf3;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .td-wrapper {
    font-family: 'Source Sans 3', -apple-system, sans-serif;
    background: var(--udemy-bg);
    min-height: 100vh;
    padding: 32px;
    color: var(--udemy-dark);
  }

  /* ── Welcome Banner ── */
  .td-banner {
    background: var(--udemy-dark);
    color: var(--udemy-white);
    padding: 28px 32px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
    animation: fadeSlide 0.3s ease both;
  }

  .td-banner-left {}

  .td-banner-greeting {
    font-size: 13px;
    font-weight: 600;
    color: #a78bfa;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 6px;
  }

  .td-banner-title {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .td-banner-title span {
    color: var(--udemy-orange);
  }

  .td-banner-sub {
    font-size: 14px;
    color: #9ca3af;
  }

  .td-banner-icon {
    font-size: 52px;
    line-height: 1;
    opacity: 0.85;
    flex-shrink: 0;
  }

  /* ── Breadcrumb ── */
  .td-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--udemy-gray);
    margin-bottom: 20px;
  }
  .td-breadcrumb a { color: var(--udemy-purple); text-decoration: none; font-weight: 500; }
  .td-breadcrumb a:hover { text-decoration: underline; }

  /* ── Stat Cards ── */
  .td-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .td-stat-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    animation: fadeSlide 0.3s ease both;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .td-stat-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }

  .td-stat-card:nth-child(1) { animation-delay: 0.05s; }
  .td-stat-card:nth-child(2) { animation-delay: 0.10s; }
  .td-stat-card:nth-child(3) { animation-delay: 0.15s; }
  .td-stat-card:nth-child(4) { animation-delay: 0.20s; }

  .td-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  .td-stat-body {}

  .td-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--udemy-dark);
    line-height: 1;
    margin-bottom: 3px;
  }

  .td-stat-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--udemy-gray);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ── Chart Card ── */
  .td-chart-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 24px;
    margin-bottom: 24px;
    animation: fadeSlide 0.35s ease both;
    animation-delay: 0.25s;
  }

  .td-chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--udemy-border);
    flex-wrap: wrap;
    gap: 10px;
  }

  .td-chart-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--udemy-dark);
  }

  .td-chart-badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--udemy-purple);
    background: var(--udemy-purple-light);
    padding: 3px 12px;
    border-radius: 20px;
  }

  /* ── Bottom grid: recent activity + quick links ── */
  .td-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    animation: fadeSlide 0.35s ease both;
    animation-delay: 0.3s;
  }

  .td-panel {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    overflow: hidden;
  }

  .td-panel-header {
    padding: 14px 20px;
    border-bottom: 1px solid var(--udemy-border);
    background: var(--udemy-bg);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--udemy-gray);
  }

  /* Recent assignments list */
  .td-assign-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid var(--udemy-border);
    gap: 10px;
    transition: background 0.1s;
  }
  .td-assign-row:last-child { border-bottom: none; }
  .td-assign-row:hover { background: var(--udemy-bg); }

  .td-assign-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--udemy-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .td-assign-meta {
    font-size: 12px;
    color: var(--udemy-gray);
    white-space: nowrap;
  }

  .td-assign-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 2px 9px;
    border-radius: 20px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .td-assign-badge.published { background: var(--udemy-green-light); color: var(--udemy-green); }
  .td-assign-badge.draft     { background: #f3f4f6; color: var(--udemy-gray); }

  /* Quick links */
  .td-quick-link {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--udemy-border);
    text-decoration: none;
    color: var(--udemy-dark);
    transition: background 0.1s;
    cursor: pointer;
  }
  .td-quick-link:last-child { border-bottom: none; }
  .td-quick-link:hover { background: var(--udemy-purple-light); }
  .td-quick-link:hover .td-ql-label { color: var(--udemy-purple); }

  .td-ql-icon {
    width: 36px; height: 36px;
    background: var(--udemy-purple-light);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .td-ql-label {
    font-size: 14px;
    font-weight: 600;
    transition: color 0.1s;
  }

  .td-ql-arrow {
    margin-left: auto;
    color: var(--udemy-gray);
    font-size: 18px;
  }

  /* ── Empty state ── */
  .td-empty {
    text-align: center;
    padding: 40px 24px;
    color: var(--udemy-gray);
    font-size: 14px;
  }

  /* ── Shimmer loader ── */
  .td-shimmer-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .td-shimmer-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .td-shimmer-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .td-shimmer-circle {
    width: 48px; height: 48px;
    border-radius: 0;
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
    flex-shrink: 0;
  }

  .td-shimmer-bar {
    height: 14px;
    border-radius: 2px;
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  .td-shimmer-block {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    padding: 24px;
    height: 240px;
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .td-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .td-bottom-grid { grid-template-columns: 1fr; }
    .td-shimmer-row { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 540px) {
    .td-wrapper { padding: 16px; }
    .td-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .td-banner { padding: 20px; }
    .td-banner-icon { display: none; }
  }
`;

const STAT_CONFIG = [
  { key: 'assignments', icon: '📝', label: 'Assignments', bg: '#f0e9ff', iconColor: '#5624d0' },
  { key: 'students',    icon: '👥', label: 'Students',    bg: '#e0f2fe', iconColor: '#0369a1' },
  { key: 'submissions', icon: '📬', label: 'Submissions', bg: '#fff7ed', iconColor: '#c2410c' },
  { key: 'assessments', icon: '📊', label: 'Assessments', bg: '#f0fdf4', iconColor: '#15803d' },
];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [perf, setPerf] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      teacherAPI.getPerformance(),
      teacherAPI.getAssignments(),
      teacherAPI.getStudents(),
    ])
      .then(([{ data: p }, { data: a }, { data: s }]) => {
        setPerf(p.performance);
        setAssignments(a.assignments);
        setStudents(s.students);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const totalSubmissions = perf.reduce((acc, p) => acc + p.submissions, 0);

  const statValues = {
    assignments: assignments.length,
    students: students.length,
    submissions: totalSubmissions,
    assessments: perf.length,
  };

  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="td-wrapper">

        {/* Breadcrumb */}
        <div className="td-breadcrumb">
          <a href="#">Home</a>
          <span>›</span>
          <span>Dashboard</span>
        </div>

        {/* Welcome Banner */}
        <div className="td-banner">
          <div className="td-banner-left">
            <div className="td-banner-greeting">Instructor Dashboard</div>
            <div className="td-banner-title">
              Welcome back, <span>{user?.name || 'Teacher'}</span> 👋
            </div>
            <div className="td-banner-sub">Manage your classes and track student progress</div>
          </div>
          <div className="td-banner-icon">📚</div>
        </div>

        {/* Loading shimmer */}
        {loading && (
          <div className="td-shimmer-wrapper">
            <div className="td-shimmer-row">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="td-shimmer-card">
                  <div className="td-shimmer-circle" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="td-shimmer-bar" style={{ width: '60%', height: 20 }} />
                    <div className="td-shimmer-bar" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="td-shimmer-block" />
          </div>
        )}

        {!loading && (
          <>
            {/* Stat Cards */}
            <div className="td-stats-grid">
              {STAT_CONFIG.map((cfg) => (
                <div key={cfg.key} className="td-stat-card">
                  <div className="td-stat-icon" style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div className="td-stat-body">
                    <div className="td-stat-value">{statValues[cfg.key]}</div>
                    <div className="td-stat-label">{cfg.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Chart */}
            <div className="td-chart-card">
              <div className="td-chart-header">
                <div className="td-chart-title">Average Scores by Assignment</div>
                {perf.length > 0 && (
                  <span className="td-chart-badge">{perf.length} assignments</span>
                )}
              </div>
              {perf.length > 0 ? (
                <PerformanceChart
                  labels={perf.map((p) => p.title)}
                  scores={perf.map((p) => parseFloat(p.avgScore))}
                  label="Avg Score"
                />
              ) : (
                <div className="td-empty">No submission data yet.</div>
              )}
            </div>

            {/* Bottom panels */}
            <div className="td-bottom-grid">

              {/* Recent Assignments */}
              <div className="td-panel">
                <div className="td-panel-header">Recent Assignments</div>
                {recentAssignments.length === 0 ? (
                  <div className="td-empty">No assignments yet.</div>
                ) : (
                  recentAssignments.map((a) => (
                    <div key={a._id} className="td-assign-row">
                      <div className="td-assign-name">{a.title}</div>
                      <div className="td-assign-meta">{a.questions?.length || 0} Qs</div>
                      <span className={`td-assign-badge ${a.isPublished ? 'published' : 'draft'}`}>
                        {a.isPublished ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Links */}
              <div className="td-panel">
                <div className="td-panel-header">Quick Actions</div>
                {[
                  { icon: '📝', label: 'Create New Assignment', href: '/teacher/assignments' },
                  { icon: '👥', label: 'View All Students',     href: '/teacher/students'    },
                  { icon: '📊', label: 'View Performance',      href: '/teacher/performance' },
                  { icon: '⚙️', label: 'Account Settings',      href: '/settings'            },
                ].map((link) => (
                  <a key={link.label} className="td-quick-link" href={link.href}>
                    <div className="td-ql-icon">{link.icon}</div>
                    <div className="td-ql-label">{link.label}</div>
                    <div className="td-ql-arrow">›</div>
                  </a>
                ))}
              </div>

            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;