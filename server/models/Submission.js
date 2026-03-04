// models/Submission.js — Student's submitted answers
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // answers: array of { question, selectedOption, openAnswer }
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedOption: { type: Number, default: null }, // For MCQ
        openAnswer: { type: String, default: '' },       // For open-text
        isCorrect: { type: Boolean, default: false },    // Set during auto-grade
        marksAwarded: { type: Number, default: 0 },
      },
    ],
    totalScore: { type: Number, default: 0 },
    // Status tracks lifecycle of submission
    status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
