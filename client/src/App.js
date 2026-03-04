// App.js — Root component with React Router + auth routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import Assignments from './pages/student/Assignments';
import Grades from './pages/student/Grades';
import Leaderboard from './pages/student/Leaderboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import Students from './pages/teacher/Students';
import Performance from './pages/teacher/Performance';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// ── Smart root redirect based on role ───────────────────────
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      {/* Toast notifications — position top-right */}
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' },
        success: { iconTheme: { primary: '#4ade80', secondary: '#0f172a' } },
        error: { iconTheme: { primary: '#f87171', secondary: '#0f172a' } },
      }} />

      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/unauthorized" element={<div className="unauth-page">🚫 Access Denied</div>} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute roles={['student','admin']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute roles={['student','admin']}><Assignments /></ProtectedRoute>} />
        <Route path="/student/grades" element={<ProtectedRoute roles={['student','admin']}><Grades /></ProtectedRoute>} />
        <Route path="/student/leaderboard" element={<ProtectedRoute roles={['student','admin']}><Leaderboard /></ProtectedRoute>} />

        {/* Teacher routes */}
        <Route path="/teacher/dashboard" element={<ProtectedRoute roles={['teacher','admin']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute roles={['teacher','admin']}><TeacherAssignments /></ProtectedRoute>} />
        <Route path="/teacher/students" element={<ProtectedRoute roles={['teacher','admin']}><Students /></ProtectedRoute>} />
        <Route path="/teacher/performance" element={<ProtectedRoute roles={['teacher','admin']}><Performance /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
