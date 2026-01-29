const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getTeacherDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/teacher', authorize('teacher'), getTeacherDashboard);

module.exports = router;