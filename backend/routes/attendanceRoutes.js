const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getAttendanceByDate,
  getStudentAttendance,
  getMonthlySummary,
  exportCSV,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', markAttendance);
router.post('/bulk', markBulkAttendance);
router.get('/date/:date', getAttendanceByDate);
router.get('/student/:studentId', getStudentAttendance);
router.get('/summary/monthly', getMonthlySummary);
router.get('/export/csv', exportCSV);

router.route('/:id')
  .put(updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

module.exports = router;