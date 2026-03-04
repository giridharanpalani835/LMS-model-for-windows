const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createAssignment,
  getMyAssignments,
  publishAssignment,
  deleteAssignment,
  addQuestion,
  editQuestion,
  deleteQuestion,
  getStudents,
  getStudentPerformance,
  exportResults,
} = require('../controllers/teacherController');

router.use(protect, authorize('teacher', 'admin'));

router.post('/assignments', createAssignment);
router.get('/assignments', getMyAssignments);
router.put('/assignments/:id/publish', publishAssignment);
router.delete('/assignments/:id', deleteAssignment);

router.post('/questions', addQuestion);
router.put('/questions/:id', editQuestion);
router.delete('/questions/:id', deleteQuestion);

router.get('/students', getStudents);
router.get('/performance', getStudentPerformance);
router.get('/export', exportResults);

module.exports = router;
