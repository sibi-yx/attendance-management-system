const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
exports.getTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { role: 'teacher' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: teachers.length,
      total,
      pages: Math.ceil(total / limit),
      teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.params.id).select('-password');

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      success: true,
      teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    next(error);
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private/Admin
exports.createTeacher = async (req, res, next) => {
  try {
    console.log('Creating teacher with data:', req.body);

    const { name, email, password, phone, subject } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create teacher
    const teacher = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      subject: subject || '',
      role: 'teacher',
      isActive: true
    });

    console.log('Teacher created successfully:', teacher.email);

    res.status(201).json({
      success: true,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        subject: teacher.subject,
        role: teacher.role,
        isActive: teacher.isActive
      }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
exports.updateTeacher = async (req, res, next) => {
  try {
    console.log('Updating teacher:', req.params.id, 'with data:', req.body);

    // Remove password from update if it's empty
    if (req.body.password === '' || !req.body.password) {
      delete req.body.password;
    }

    const teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Update fields
    const allowedFields = ['name', 'email', 'phone', 'subject', 'password', 'isActive'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    await teacher.save();

    console.log('Teacher updated successfully:', teacher.email);

    res.status(200).json({
      success: true,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        subject: teacher.subject,
        role: teacher.role,
        isActive: teacher.isActive
      }
    });
  } catch (error) {
    console.error('Update teacher error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = async (req, res, next) => {
  try {
    console.log('Deleting teacher:', req.params.id);

    const teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    await teacher.deleteOne();

    console.log('Teacher deleted successfully:', teacher.email);

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    next(error);
  }
};