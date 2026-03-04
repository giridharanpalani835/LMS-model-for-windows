// models/Leaderboard.js — Ranked student scores (updated on every submission)
const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalScore: { type: Number, default: 0 },
    submissionsCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Static method to recalculate all ranks ──────────────────
leaderboardSchema.statics.recalculateRanks = async function () {
  const entries = await this.find().sort({ totalScore: -1 });
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    await entries[i].save();
  }
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
