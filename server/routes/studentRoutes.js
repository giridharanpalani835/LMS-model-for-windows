const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAssignments,
  submitAssignment,
  getGrades,
  getDashboard,
} = require('../controllers/studentController');

// All student routes require authentication + student role
router.use(protect, authorize('student', 'admin'));

router.get('/assignments', getAssignments);
router.post('/submit', submitAssignment);
router.get('/grades', getGrades);
router.get('/dashboard', getDashboard);

module.exports = router;
