// pages/admin/UserManagement.js — Full CRUD for users
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const roleColors = { student: '#6ee7f7', teacher: '#a78bfa', admin: '#fb923c' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => adminAPI.getUsers()
    .then(({ data }) => setUsers(data.users))
    .catch(() => toast.error('Failed to load users'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.changeRole(id, role);
      toast.success('Role updated!');
      load();
    } catch { toast.error('Failed to update role'); }
  };

  const handleToggle = async (id) => {
    await adminAPI.toggleUser(id);
    toast.success('Status toggled');
    load();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    await adminAPI.deleteUser(id);
    toast.success('User deleted');
    load();
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">👥 User Management</h1>
        <input
          className="search-input"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? <div className="loading-text">Loading users…</div> : (
        <div className="grades-table-wrapper">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
                  <td className="user-name-cell">
                    <span className="mini-avatar" style={{ background: `${roleColors[u.role]}22`, border: `1.5px solid ${roleColors[u.role]}` }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </span>
                    {u.name}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
                      style={{ color: roleColors[u.role] }}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="btn-sm" onClick={() => handleToggle(u._id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(u._id, u.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state">No users found.</div>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
