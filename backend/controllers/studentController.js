const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search = '', class: className = '' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (className) {
      query.class = { $regex: className, $options: 'i' };
    }

    const students = await Student.find(query)
      .populate('assignedTeacher', 'name email subject')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      pages: Math.ceil(total / limit),
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('assignedTeacher', 'name email subject');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Get student error:', error);
    next(error);
  }
};

// @desc    Get students by teacher
// @route   GET /api/students/teacher/:teacherId
// @access  Private
exports.getStudentsByTeacher = async (req, res, next) => {
  try {
    const students = await Student.find({ assignedTeacher: req.params.teacherId })
      .sort({ class: 1, rollNumber: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get students by teacher error:', error);
    next(error);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = async (req, res, next) => {
  try {
    console.log('Creating student with data:', req.body);

    // Check if student with same email or studentId exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: req.body.email },
        { studentId: req.body.studentId }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email or student ID already exists'
      });
    }

    const student = await Student.create(req.body);

    console.log('Student created successfully:', student.studentId);

    res.status(201).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Create student error:', error);
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
  try {
    console.log('Updating student:', req.params.id, 'with data:', req.body);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    console.log('Student updated successfully:', student.studentId);

    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error('Update student error:', error);
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
  try {
    console.log('Deleting student:', req.params.id);

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await student.deleteOne();

    console.log('Student deleted successfully:', student.studentId);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    next(error);
  }
};