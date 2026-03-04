// pages/teacher/Students.js — View enrolled students list
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Udemy+Sans:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600&display=swap');

  :root {
    --udemy-purple: #5624d0;
    --udemy-purple-hover: #3d1a9e;
    --udemy-purple-light: #f0e9ff;
    --udemy-dark: #1c1d1f;
    --udemy-mid: #3d3d3d;
    --udemy-gray: #6a6f73;
    --udemy-border: #d1d7dc;
    --udemy-bg: #f7f9fa;
    --udemy-white: #ffffff;
    --udemy-orange: #f69c08;
    --udemy-green: #1e6055;
    --udemy-green-light: #ecfdf3;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .udemy-students-wrapper {
    font-family: 'Source Sans 3', 'Udemy Sans', -apple-system, sans-serif;
    background: var(--udemy-bg);
    min-height: 100vh;
    padding: 32px;
    color: var(--udemy-dark);
  }

  /* ── Page Header ── */
  .udemy-page-header {
    margin-bottom: 28px;
  }

  .udemy-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--udemy-gray);
    margin-bottom: 12px;
  }

  .udemy-breadcrumb a {
    color: var(--udemy-purple);
    text-decoration: none;
    font-weight: 500;
  }

  .udemy-breadcrumb a:hover { text-decoration: underline; }

  .udemy-breadcrumb-sep { color: var(--udemy-border); }

  .udemy-title-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .udemy-page-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--udemy-dark);
    letter-spacing: -0.3px;
    line-height: 1.2;
  }

  .udemy-student-count-badge {
    background: var(--udemy-purple-light);
    color: var(--udemy-purple);
    font-size: 13px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
    margin-left: 10px;
    vertical-align: middle;
  }

  /* ── Toolbar ── */
  .udemy-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .udemy-search-wrap {
    position: relative;
    flex: 1;
    min-width: 240px;
    max-width: 420px;
  }

  .udemy-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--udemy-gray);
    pointer-events: none;
    font-size: 16px;
  }

  .udemy-search-input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid var(--udemy-dark);
    border-radius: 0;
    font-size: 14px;
    font-family: inherit;
    color: var(--udemy-dark);
    background: var(--udemy-white);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .udemy-search-input::placeholder { color: var(--udemy-gray); }

  .udemy-search-input:focus {
    border-color: var(--udemy-dark);
    box-shadow: 0 0 0 2px rgba(28,29,31,0.15);
  }

  .udemy-filter-btn {
    padding: 10px 16px;
    border: 1px solid var(--udemy-dark);
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    color: var(--udemy-dark);
    border-radius: 0;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .udemy-filter-btn:hover { background: var(--udemy-bg); }

  /* ── Summary Stats ── */
  .udemy-stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .udemy-stat-card {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    border-radius: 0;
    padding: 18px 24px;
    flex: 1;
    min-width: 140px;
    max-width: 220px;
  }

  .udemy-stat-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--udemy-gray);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .udemy-stat-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--udemy-dark);
    line-height: 1;
  }

  .udemy-stat-value.purple { color: var(--udemy-purple); }

  /* ── Students Table / List ── */
  .udemy-students-table {
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
    border-radius: 0;
    overflow: hidden;
  }

  .udemy-table-header {
    display: grid;
    grid-template-columns: 40px 2fr 2fr 1fr 80px;
    align-items: center;
    padding: 12px 20px;
    background: var(--udemy-bg);
    border-bottom: 1px solid var(--udemy-border);
    font-size: 12px;
    font-weight: 700;
    color: var(--udemy-gray);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    gap: 16px;
  }

  .udemy-student-row {
    display: grid;
    grid-template-columns: 40px 2fr 2fr 1fr 80px;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--udemy-border);
    gap: 16px;
    transition: background 0.1s;
    animation: fadeSlide 0.3s ease both;
  }

  .udemy-student-row:last-child { border-bottom: none; }
  .udemy-student-row:hover { background: #fafafa; }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* staggered delay on rows */
  .udemy-student-row:nth-child(1)  { animation-delay: 0.04s; }
  .udemy-student-row:nth-child(2)  { animation-delay: 0.08s; }
  .udemy-student-row:nth-child(3)  { animation-delay: 0.12s; }
  .udemy-student-row:nth-child(4)  { animation-delay: 0.16s; }
  .udemy-student-row:nth-child(5)  { animation-delay: 0.20s; }
  .udemy-student-row:nth-child(6)  { animation-delay: 0.24s; }
  .udemy-student-row:nth-child(n+7){ animation-delay: 0.28s; }

  /* Avatar */
  .udemy-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--udemy-purple);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0;
  }

  .udemy-avatar.alt-0 { background: #5624d0; }
  .udemy-avatar.alt-1 { background: #1e6055; }
  .udemy-avatar.alt-2 { background: #b4690e; }
  .udemy-avatar.alt-3 { background: #c0392b; }
  .udemy-avatar.alt-4 { background: #1a5276; }

  /* Name / email cell */
  .udemy-student-name-cell {
    min-width: 0;
  }

  .udemy-sname {
    font-size: 14px;
    font-weight: 600;
    color: var(--udemy-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .udemy-semail {
    font-size: 13px;
    color: var(--udemy-gray);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .udemy-email-standalone {
    font-size: 14px;
    color: var(--udemy-mid);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .udemy-joined-cell {
    font-size: 13px;
    color: var(--udemy-gray);
  }

  /* Status pill */
  .udemy-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    background: var(--udemy-green-light);
    color: var(--udemy-green);
  }

  .udemy-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--udemy-green);
    flex-shrink: 0;
  }

  /* ── Empty / Loading ── */
  .udemy-empty-state {
    text-align: center;
    padding: 64px 24px;
    color: var(--udemy-gray);
    font-size: 15px;
  }

  .udemy-empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .udemy-empty-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--udemy-dark);
    margin-bottom: 6px;
  }

  .udemy-loading-shimmer {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--udemy-white);
    border: 1px solid var(--udemy-border);
  }

  .udemy-shimmer-row {
    display: grid;
    grid-template-columns: 40px 2fr 2fr 1fr 80px;
    align-items: center;
    padding: 16px 20px;
    gap: 16px;
  }

  .udemy-shimmer-circle {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  .udemy-shimmer-bar {
    height: 14px;
    border-radius: 2px;
    background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Search highlight */
  mark.udemy-highlight {
    background: #fef08a;
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }

  /* Responsive */
  @media (max-width: 700px) {
    .udemy-students-wrapper { padding: 16px; }

    .udemy-table-header,
    .udemy-student-row,
    .udemy-shimmer-row {
      grid-template-columns: 36px 1fr 1fr;
    }

    .udemy-table-header > *:nth-child(4),
    .udemy-table-header > *:nth-child(5),
    .udemy-student-row > *:nth-child(4),
    .udemy-student-row > *:nth-child(5),
    .udemy-shimmer-row > *:nth-child(4),
    .udemy-shimmer-row > *:nth-child(5) {
      display: none;
    }

    .udemy-stats-row { gap: 10px; }
    .udemy-stat-card { padding: 14px 16px; }
  }
`;

/* Highlight matching text */
function Highlight({ text, query }) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="udemy-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const AVATAR_ALTS = 5;

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    teacherAPI.getStudents()
      .then(({ data }) => setStudents(data.students))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const thisMonth = students.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <DashboardLayout>
      <style>{styles}</style>

      <div className="udemy-students-wrapper">

        {/* Breadcrumb */}
        <div className="udemy-page-header">
          <div className="udemy-breadcrumb">
            <a href="#">Dashboard</a>
            <span className="udemy-breadcrumb-sep">›</span>
            <span>Students</span>
          </div>

          <div className="udemy-title-row">
            <h1 className="udemy-page-title">
              Students
              {!loading && (
                <span className="udemy-student-count-badge">
                  {students.length} enrolled
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="udemy-stats-row">
            <div className="udemy-stat-card">
              <div className="udemy-stat-label">Total Students</div>
              <div className="udemy-stat-value purple">{students.length}</div>
            </div>
            <div className="udemy-stat-card">
              <div className="udemy-stat-label">New This Month</div>
              <div className="udemy-stat-value">{thisMonth}</div>
            </div>
            <div className="udemy-stat-card">
              <div className="udemy-stat-label">Search Results</div>
              <div className="udemy-stat-value">{filtered.length}</div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="udemy-toolbar">
          <div className="udemy-search-wrap">
            <span className="udemy-search-icon">🔍</span>
            <input
              className="udemy-search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="udemy-filter-btn">
            ≡ Filter
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="udemy-loading-shimmer">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="udemy-shimmer-row">
                <div className="udemy-shimmer-circle" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="udemy-shimmer-bar" style={{ width: '60%' }} />
                  <div className="udemy-shimmer-bar" style={{ width: '40%', opacity: 0.6 }} />
                </div>
                <div className="udemy-shimmer-bar" style={{ width: '70%' }} />
                <div className="udemy-shimmer-bar" style={{ width: '50%' }} />
                <div className="udemy-shimmer-bar" style={{ width: '55%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="udemy-students-table">
            <div className="udemy-table-header">
              <div></div>
              <div>Student</div>
              <div>Email</div>
              <div>Joined</div>
              <div>Status</div>
            </div>

            {filtered.length === 0 ? (
              <div className="udemy-empty-state">
                <div className="udemy-empty-icon">👥</div>
                <div className="udemy-empty-title">No students found</div>
                <div>Try adjusting your search or filters.</div>
              </div>
            ) : (
              filtered.map((s, i) => (
                <div key={s._id} className="udemy-student-row">
                  {/* Avatar */}
                  <div className={`udemy-avatar alt-${i % AVATAR_ALTS}`}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="udemy-student-name-cell">
                    <div className="udemy-sname">
                      <Highlight text={s.name} query={search} />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="udemy-email-standalone">
                    <Highlight text={s.email} query={search} />
                  </div>

                  {/* Joined */}
                  <div className="udemy-joined-cell">
                    {new Date(s.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </div>

                  {/* Status */}
                  <div>
                    <span className="udemy-status-pill">
                      <span className="udemy-status-dot" />
                      Active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Students;