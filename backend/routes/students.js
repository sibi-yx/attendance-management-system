const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  getStudentsByTeacher,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getStudents)
  .post(protect, authorize('admin'), createStudent);

router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

router.get('/teacher/:teacherId', protect, getStudentsByTeacher);

module.exports = router;