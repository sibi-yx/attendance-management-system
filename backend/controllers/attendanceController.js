const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
exports.markAttendance = async (req, res, next) => {
  try {
    const { student, date, status, remarks } = req.body;

    // Validate required fields
    if (!student || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student, date, and status'
      });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({ 
      student, 
      date: new Date(date) 
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student on this date'
      });
    }

    const attendance = await Attendance.create({
      student,
      teacher: req.user._id,
      date: new Date(date),
      status,
      remarks: remarks || ''
    });

    res.status(201).json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    next(error);
  }
};

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk
// @access  Private (Teacher/Admin)
exports.markBulkAttendance = async (req, res, next) => {
  try {
    const attendanceRecords = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of attendance records'
      });
    }

    // Add teacher ID to each record
    const recordsWithTeacher = attendanceRecords.map(record => ({
      student: record.student,
      teacher: req.user._id,
      date: new Date(record.date),
      status: record.status,
      remarks: record.remarks || ''
    }));

    // Use bulkWrite for upsert
    const bulkOps = recordsWithTeacher.map(record => ({
      updateOne: {
        filter: { 
          student: record.student, 
          date: record.date 
        },
        update: { $set: record },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    res.status(201).json({
      success: true,
      message: 'Bulk attendance marked successfully',
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });
  } catch (error) {
    console.error('Bulk attendance error:', error);
    next(error);
  }
};

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Private
exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { teacherId } = req.query;

    const query = { 
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    };

    if (teacherId) {
      query.teacher = teacherId;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId class section')
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    // Create a map for quick lookup
    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.student._id.toString()] = record;
    });

    res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
      attendanceMap
    });
  } catch (error) {
    console.error('Get attendance by date error:', error);
    next(error);
  }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getAttendanceByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { student: studentId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('teacher', 'name email')
      .sort({ date: -1 });

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Calculate summary
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const presentPercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      student,
      attendance,
      summary: {
        total,
        present,
        absent,
        presentPercentage: parseFloat(presentPercentage)
      }
    });
  } catch (error) {
    console.error('Get attendance by student error:', error);
    next(error);
  }
};

// @desc    Get monthly summary
// @route   GET /api/attendance/summary/monthly
// @access  Private
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year, class: className, teacherId } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const matchStage = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (teacherId) {
      matchStage.teacher = new mongoose.Types.ObjectId(teacherId);
    }

    let summary = await Attendance.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$student',
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
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
            $round: [
              { $multiply: [{ $divide: ['$present', '$total'] }, 100] },
              2
            ]
          }
        }
      },
      { $sort: { 'student.name': 1 } }
    ]);

    // Filter by class if provided
    if (className) {
      summary = summary.filter(s => 
        s.student.class.toLowerCase().includes(className.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: summary.length,
      summary
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    next(error);
  }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Teacher/Admin)
exports.updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    next(error);
  }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attendance deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    next(error);
  }
};

// @desc    Export attendance as CSV
// @route   GET /api/attendance/export/csv
// @access  Private
exports.exportCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, class: className, studentId, teacherId } = req.query;

    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (teacherId) {
      query.teacher = teacherId;
    }

    if (studentId) {
      query.student = studentId;
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'studentId name class section')
      .populate('teacher', 'name email')
      .sort({ date: -1 });

    // Filter by class if provided
    let filteredAttendance = attendance;
    if (className) {
      filteredAttendance = attendance.filter(a => 
        a.student && a.student.class.toLowerCase().includes(className.toLowerCase())
      );
    }

    // Create CSV
    let csv = 'Date,Student ID,Student Name,Class,Section,Status,Remarks,Teacher\n';

    filteredAttendance.forEach(record => {
      const date = new Date(record.date).toLocaleDateString();
      const studentId = record.student?.studentId || 'N/A';
      const studentName = record.student?.name || 'N/A';
      const studentClass = record.student?.class || 'N/A';
      const section = record.student?.section || '';
      const status = record.status;
      const remarks = (record.remarks || '').replace(/,/g, ';');
      const teacher = record.teacher?.name || 'N/A';

      csv += `${date},${studentId},${studentName},${studentClass},${section},${status},${remarks},${teacher}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    next(error);
  }
};