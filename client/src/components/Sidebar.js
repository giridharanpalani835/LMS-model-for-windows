// components/Sidebar.js — Role-aware navigation sidebar
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  student: [
    { path: '/student/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/student/assignments', label: 'Assignments', icon: '📋' },
    { path: '/student/grades', label: 'My Grades', icon: '🏆' },
    { path: '/student/leaderboard', label: 'Leaderboard', icon: '🥇' },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/teacher/assignments', label: 'Assignments', icon: '📝' },
    { path: '/teacher/students', label: 'Students', icon: '👥' },
    { path: '/teacher/performance', label: 'Performance', icon: '📊' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Overview', icon: '⚡' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColors = { student: '#6ee7f7', teacher: '#a78bfa', admin: '#fb923c' };
  const roleColor = roleColors[user?.role] || '#6ee7f7';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <span className="brand-icon">✦</span>
        <span className="brand-text">EduFlow</span>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: `${roleColor}22`, border: `2px solid ${roleColor}` }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <span className="user-role" style={{ color: roleColor }}>{user?.role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <span>⎋</span> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
