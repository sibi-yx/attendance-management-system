const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Total counts
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });

    // Today's attendance
    const todayAttendance = await Attendance.find({ 
      date: { $gte: today, $lt: tomorrow }
    });
    
    const todayPresent = todayAttendance.filter(a => a.status === 'present').length;
    const todayAbsent = todayAttendance.filter(a => a.status === 'absent').length;
    const todayTotal = todayAttendance.length;

    // Monthly summary (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlySummary = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$student',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          student: 1,
          present: 1,
          absent: 1,
          total: 1,
          presentPercentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2]
          }
        }
      },
      { $sort: { present: -1 } },
      { $limit: 5 }
    ]);

    // Class-wise distribution
    const classWiseDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$class',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent activities
    const recentActivities = await Attendance.find()
      .populate('student', 'name studentId class')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Low attendance students (<75%)
    const lowAttendanceStudents = await Attendance.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$student',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2]
          }
        }
      },
      { $match: { attendancePercentage: { $lt: 75 } } },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          name: '$student.name',
          studentId: '$student.studentId',
          class: '$student.class',
          attendancePercentage: 1
        }
      },
      { $sort: { attendancePercentage: 1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      totalStudents,
      totalTeachers,
      todayPresent,
      todayAbsent,
      todayTotal,
      monthlySummary,
      classWiseDistribution,
      recentActivities,
      lowAttendanceStudents
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    next(error);
  }
};

// @desc    Get teacher dashboard data
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher
exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get students assigned to this teacher
    const assignedStudents = await Student.find({ assignedTeacher: req.user._id });
    const studentIds = assignedStudents.map(s => s._id);

    const totalStudents = assignedStudents.length;

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
      student: { $in: studentIds }
    });
    
    const todayPresent = todayAttendance.filter(a => a.status === 'present').length;
    const todayAbsent = todayAttendance.filter(a => a.status === 'absent').length;
    const todayTotal = todayAttendance.length;

    // Recent attendance records
    const recentAttendance = await Attendance.find({
      teacher: req.user._id,
      student: { $in: studentIds }
    })
      .populate('student', 'name studentId class')
      .sort({ createdAt: -1 })
      .limit(5);

    // Class-wise distribution
    const classSummary = assignedStudents.reduce((acc, student) => {
      const className = student.class;
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {});

    const classWiseDistribution = Object.entries(classSummary).map(([key, value]) => ({
      _id: key,
      count: value
    }));

    // Low attendance students
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lowAttendanceStudents = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
          student: { $in: studentIds }
        }
      },
      {
        $group: {
          _id: '$student',
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2]
          }
        }
      },
      { $match: { attendancePercentage: { $lt: 75 } } },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          name: '$student.name',
          studentId: '$student.studentId',
          class: '$student.class',
          attendancePercentage: 1
        }
      },
      { $sort: { attendancePercentage: 1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      totalStudents,
      todayPresent,
      todayAbsent,
      todayTotal,
      recentAttendance,
      classSummary: classWiseDistribution,
      lowAttendanceStudents
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    next(error);
  }
};