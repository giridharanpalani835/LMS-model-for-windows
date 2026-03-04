// controllers/studentController.js — All student-facing API logic
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

// ── GET /api/student/assignments ─────────────────────────────
// Returns all published assignments assigned to this student
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      assignedTo: req.user._id,
      isPublished: true,
    })
      .populate('createdBy', 'name')
      .populate('questions')
      .sort({ dueDate: 1 });

    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/student/submit ──────────────────────────────────
// Auto-grades MCQ answers; stores open text for teacher review
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, answers } = req.body;

    // Prevent duplicate submissions
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const assignment = await Assignment.findById(assignmentId).populate('questions');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    let totalScore = 0;
    const gradedAnswers = [];

    // ── Auto-grade each answer ──────────────────────────────
    for (const ans of answers) {
      const question = assignment.questions.find((q) => q._id.toString() === ans.questionId);
      if (!question) continue;

      let isCorrect = false;
      let marksAwarded = 0;

      if (question.type === 'mcq') {
        isCorrect = ans.selectedOption === question.correctOption;
        marksAwarded = isCorrect ? question.marks : 0;
      } else {
        // Open-text: award partial credit or await teacher grading
        marksAwarded = 0; // Teacher grades manually later
      }

      totalScore += marksAwarded;
      gradedAnswers.push({
        question: question._id,
        selectedOption: ans.selectedOption ?? null,
        openAnswer: ans.openAnswer ?? '',
        isCorrect,
        marksAwarded,
      });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      answers: gradedAnswers,
      totalScore,
      status: assignment.type === 'assessment' ? 'graded' : 'submitted',
    });

    // ── Update leaderboard after submission (non-fatal if it fails) ────
    try { await updateLeaderboard(req.user._id, totalScore); } catch (lbErr) { console.error('Leaderboard update failed:', lbErr.message); }

    res.status(201).json({ submission, totalScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/student/grades ───────────────────────────────────
exports.getGrades = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title type totalMarks')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/student/dashboard ────────────────────────────────
// Returns analytics data: submission count, avg score, recent grades
exports.getDashboard = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id }).populate('assignment', 'title totalMarks');
    const totalSubmissions = submissions.length;
    const totalScore = submissions.reduce((acc, s) => acc + s.totalScore, 0);
    const avgScore = totalSubmissions ? (totalScore / totalSubmissions).toFixed(2) : 0;

    // Score over time for Chart.js line chart
    const scoreHistory = submissions.slice(-10).map((s) => ({
      label: s.assignment?.title || 'Assignment',
      score: s.totalScore,
      date: s.submittedAt,
    }));

    const leaderboard = await Leaderboard.findOne({ student: req.user._id });

    res.json({ totalSubmissions, avgScore, totalScore, scoreHistory, rank: leaderboard?.rank || '-' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Internal: update leaderboard entry ───────────────────────
async function updateLeaderboard(studentId, newScore) {
  let entry = await Leaderboard.findOne({ student: studentId });
  if (entry) {
    entry.totalScore += newScore;
    entry.submissionsCount += 1;
    entry.averageScore = entry.totalScore / entry.submissionsCount;
    await entry.save();
  } else {
    await Leaderboard.create({ student: studentId, totalScore: newScore, submissionsCount: 1, averageScore: newScore });
  }
  // Recalculate all ranks after update
  await Leaderboard.recalculateRanks();
}
