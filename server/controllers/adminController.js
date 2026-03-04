// controllers/adminController.js — Full system management for admins
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Leaderboard = require('../models/Leaderboard');

// ── GET /api/admin/users ─────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/admin/users/:id/role ────────────────────────────
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/admin/users/:id ──────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/admin/users/:id/toggle ──────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/overview ───────────────────────────────────
// System-wide analytics for admin dashboard
exports.getOverview = async (req, res) => {
  try {
    const [totalUsers, totalAssignments, totalSubmissions, students, teachers] = await Promise.all([
      User.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
    ]);

    // Recent signups per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } }).select('createdAt role');

    // Submissions per day for chart
    const recentSubmissions = await Submission.find({ submittedAt: { $gte: sevenDaysAgo } }).select('submittedAt totalScore');

    res.json({
      totalUsers,
      totalAssignments,
      totalSubmissions,
      students,
      teachers,
      recentUsers,
      recentSubmissions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
