// models/Assignment.js — Homework / assessment created by teachers
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    // type: homework = open text | assessment = auto-graded MCQ
    type: { type: String, enum: ['homework', 'assessment'], required: true },
    // Teacher who created this assignment
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Questions embedded or referenced
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    // Students who should complete this
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
    totalMarks: { type: Number, default: 100 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
