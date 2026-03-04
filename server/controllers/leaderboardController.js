// controllers/leaderboardController.js — Public leaderboard rankings
const Leaderboard = require('../models/Leaderboard');

// ── GET /api/leaderboard ─────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leaderboard = await Leaderboard.find()
      .sort({ rank: 1 })
      .limit(limit)
      .populate('student', 'name avatar');

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/leaderboard/me ───────────────────────────────────
exports.getMyRank = async (req, res) => {
  try {
    const entry = await Leaderboard.findOne({ student: req.user._id }).populate('student', 'name');
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
