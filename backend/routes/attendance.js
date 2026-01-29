const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getAttendanceByDate,
  getAttendanceByStudent,
  getMonthlySummary,
  updateAttendance,
  deleteAttendance,
  exportCSV
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('teacher', 'admin'), markAttendance);

router.post('/bulk', protect, authorize('teacher', 'admin'), markBulkAttendance);

router.get('/date/:date', protect, getAttendanceByDate);

router.get('/student/:studentId', protect, getAttendanceByStudent);

router.get('/summary/monthly', protect, getMonthlySummary);

router.get('/export/csv', protect, exportCSV);

router
  .route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateAttendance)
  .delete(protect, authorize('admin'), deleteAttendance);

module.exports = router;