// components/StatCard.js — Reusable metric card for dashboards
const StatCard = ({ icon, label, value, color = '#6ee7f7', sub }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </div>
);

export default StatCard;
