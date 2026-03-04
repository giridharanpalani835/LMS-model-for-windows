// controllers/teacherController.js — Teacher CRUD for assignments, questions, students
const Assignment = require('../models/Assignment');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const User = require('../models/User');

// ── POST /api/teacher/assignments ────────────────────────────
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, type, assignedTo, dueDate, totalMarks } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      type,
      assignedTo,
      dueDate,
      totalMarks,
      createdBy: req.user._id,
    });
    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/teacher/assignments ─────────────────────────────
exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate('questions')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/teacher/assignments/:id/publish ──────────────────
exports.publishAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { isPublished: true },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/teacher/assignments/:id ──────────────────────
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/teacher/questions ──────────────────────────────
exports.addQuestion = async (req, res) => {
  try {
    const { assignmentId, text, options, correctOption, type, marks } = req.body;

    const question = await Question.create({
      assignment: assignmentId,
      text,
      options,
      correctOption,
      type,
      marks,
      createdBy: req.user._id,
    });

    // Link question to assignment
    await Assignment.findByIdAndUpdate(assignmentId, { $push: { questions: question._id } });

    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/teacher/questions/:id ───────────────────────────
exports.editQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/teacher/questions/:id ────────────────────────
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (question) {
      await Assignment.findByIdAndUpdate(question.assignment, { $pull: { questions: question._id } });
    }
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/teacher/students ────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true }).select('name email createdAt');
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/teacher/performance ─────────────────────────────
// Returns submission data for all assignments by this teacher
exports.getStudentPerformance = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id }).select('_id title');
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'name')
      .populate('assignment', 'title totalMarks');

    // Aggregate by assignment
    const performance = assignments.map((a) => {
      const subs = submissions.filter((s) => s.assignment._id.toString() === a._id.toString());
      const avg = subs.length ? subs.reduce((acc, s) => acc + s.totalScore, 0) / subs.length : 0;
      return { title: a.title, submissions: subs.length, avgScore: avg.toFixed(2), subs };
    });

    res.json({ performance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/teacher/export ───────────────────────────────────
// Export results as JSON (frontend can convert to CSV)
exports.exportResults = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id }).select('_id title');
    const assignmentIds = assignments.map((a) => a._id);
    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate('student', 'name email')
      .populate('assignment', 'title totalMarks');

    const csv = submissions.map((s) => ({
      student: s.student?.name,
      email: s.student?.email,
      assignment: s.assignment?.title,
      score: s.totalScore,
      totalMarks: s.assignment?.totalMarks,
      percentage: s.assignment?.totalMarks
        ? ((s.totalScore / s.assignment.totalMarks) * 100).toFixed(1)
        : 0,
      status: s.status,
      submittedAt: s.submittedAt,
    }));

    res.json({ results: csv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
