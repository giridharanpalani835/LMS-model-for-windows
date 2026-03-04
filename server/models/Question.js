// models/Question.js — MCQ or open-text questions for assessments
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    text: { type: String, required: true },
    // MCQ: options array; open: leave empty
    options: [{ type: String }],
    // correctOption index for MCQ auto-grading (0-based)
    correctOption: { type: Number, default: null },
    // Question type determines grading logic
    type: { type: String, enum: ['mcq', 'open'], default: 'mcq' },
    marks: { type: Number, default: 10 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
