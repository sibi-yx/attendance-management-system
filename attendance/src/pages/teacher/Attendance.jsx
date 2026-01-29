import { useState, useEffect } from 'react';
import { attendanceAPI, studentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaClipboardCheck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaCalendar,
  FaSave,
  FaUndo,
  FaEdit,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getTodayDate, formatDisplayDate } from '../../utils/helpers';
import './Attendance.css';

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendanceData, setAttendanceData] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notMarked: 0
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendanceForDate();
    }
  }, [selectedDate, students]);

  useEffect(() => {
    calculateStats();
  }, [attendanceData, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await studentAPI.getByTeacher(user._id);
      setStudents(data.students || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async () => {
    try {
      const { data } = await attendanceAPI.getByDate(selectedDate, {
        teacherId: user._id
      });

      const attendanceMap = {};
      const existingMap = {};
      const remarksMap = {};

      data.attendance.forEach((record) => {
        attendanceMap[record.student._id] = record.status;
        existingMap[record.student._id] = record._id;
        remarksMap[record.student._id] = record.remarks || '';
      });

      setAttendanceData(attendanceMap);
      setExistingAttendance(existingMap);
      setRemarks(remarksMap);
    } catch (error) {
      // No attendance marked yet for this date
      setAttendanceData({});
      setExistingAttendance({});
      setRemarks({});
    }
  };

  const calculateStats = () => {
    const total = students.length;
    let present = 0;
    let absent = 0;

    Object.values(attendanceData).forEach((status) => {
      if (status === 'present') present++;
      if (status === 'absent') absent++;
    });

    const notMarked = total - (present + absent);

    setStats({ total, present, absent, notMarked });
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status
    });
  };

  const handleRemarksChange = (studentId, value) => {
    setRemarks({
      ...remarks,
      [studentId]: value
    });
  };

  const handleMarkAll = (status) => {
    const newAttendanceData = {};
    students.forEach((student) => {
      newAttendanceData[student._id] = status;
    });
    setAttendanceData(newAttendanceData);
    toast.success(`All students marked as ${status}`);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all attendance marks?')) {
      setAttendanceData({});
      setRemarks({});
      toast.success('Attendance marks reset');
    }
  };

  const handleSubmit = async () => {
    // Check if all students are marked
    const unmarkedStudents = students.filter(
      (student) => !attendanceData[student._id]
    );

    if (unmarkedStudents.length > 0) {
      if (!window.confirm(
        `${unmarkedStudents.length} student(s) not marked. Continue anyway?`
      )) {
        return;
      }
    }

    try {
      setSaving(true);

      // Prepare bulk attendance data
      const bulkData = students
        .filter((student) => attendanceData[student._id])
        .map((student) => ({
          student: student._id,
          status: attendanceData[student._id],
          date: selectedDate,
          remarks: remarks[student._id] || ''
        }));

      if (bulkData.length === 0) {
        toast.error('No attendance data to save');
        return;
      }

      await attendanceAPI.markBulk(bulkData);
      toast.success('Attendance saved successfully');
      fetchAttendanceForDate(); // Refresh to get IDs
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save attendance';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRecord = async (studentId) => {
    const recordId = existingAttendance[studentId];
    if (!recordId) {
      toast.error('No existing record to update');
      return;
    }

    try {
      await attendanceAPI.update(recordId, {
        status: attendanceData[studentId],
        remarks: remarks[studentId] || ''
      });
      toast.success('Attendance updated');
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  return (
    <div className="teacher-attendance">
      <div className="attendance-container">
        {/* Header */}
        <div className="attendance-header">
          <div>
            <h1 className="attendance-title">
              <FaClipboardCheck /> Mark Attendance
            </h1>
            <p className="attendance-subtitle">Mark attendance for your assigned students</p>
          </div>
        </div>

        {/* Controls */}
        <div className="attendance-controls">
          {/* Date Selection */}
          <div className="date-selector">
            <FaCalendar className="date-icon" />
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayDate()}
            />
            <span className="date-display">{formatDisplayDate(selectedDate)}</span>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              className="quick-btn present-all-btn"
              onClick={() => handleMarkAll('present')}
            >
              <FaUserCheck /> Mark All Present
            </button>
            <button 
              className="quick-btn absent-all-btn"
              onClick={() => handleMarkAll('absent')}
            >
              <FaUserTimes /> Mark All Absent
            </button>
            <button 
              className="quick-btn reset-btn"
              onClick={handleReset}
            >
              <FaUndo /> Reset
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="attendance-stats">
          <div className="stat-card stat-total">
            <div className="stat-icon">
              <FaClipboardCheck />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Students</div>
            </div>
          </div>

          <div className="stat-card stat-present">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>

          <div className="stat-card stat-absent">
            <div className="stat-icon">
              <FaTimesCircle />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.absent}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <FaEdit />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.notMarked}</div>
              <div className="stat-label">Not Marked</div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="attendance-loading">
            <div className="attendance-spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">No Students Assigned</h3>
            <p className="empty-text">You don't have any students assigned to you yet</p>
          </div>
        ) : (
          <>
            <div className="students-list">
              {students.map((student) => {
                const currentStatus = attendanceData[student._id];
                const hasExisting = existingAttendance[student._id];

                return (
                  <div key={student._id} className="student-attendance-card">
                    <div className="student-attendance-info">
                      <div className="student-attendance-avatar">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="student-attendance-details">
                        <h4 className="student-attendance-name">{student.name}</h4>
                        <p className="student-attendance-meta">
                          {student.studentId} • {student.class} {student.section && `- ${student.section}`}
                        </p>
                      </div>
                    </div>

                    <div className="student-attendance-actions">
                      <div className="attendance-buttons">
                        <button
                          className={`attendance-btn present-btn ${
                            currentStatus === 'present' ? 'active' : ''
                          }`}
                          onClick={() => handleAttendanceChange(student._id, 'present')}
                        >
                          <FaCheckCircle /> Present
                        </button>
                        <button
                          className={`attendance-btn absent-btn ${
                            currentStatus === 'absent' ? 'active' : ''
                          }`}
                          onClick={() => handleAttendanceChange(student._id, 'absent')}
                        >
                          <FaTimesCircle /> Absent
                        </button>
                      </div>

                      <div className="remarks-section">
                        <input
                          type="text"
                          className="remarks-input"
                          placeholder="Add remarks (optional)"
                          value={remarks[student._id] || ''}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                        />
                        {hasExisting && (
                          <button
                            className="update-btn"
                            onClick={() => handleUpdateRecord(student._id)}
                            title="Update existing record"
                          >
                            <FaEdit />
                          </button>
                        )}
                      </div>
                    </div>

                    {currentStatus && (
                      <div className={`status-indicator status-${currentStatus}`}>
                        {currentStatus === 'present' ? 'Marked Present' : 'Marked Absent'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div className="attendance-footer">
              <button
                className="submit-attendance-btn"
                onClick={handleSubmit}
                disabled={saving || Object.keys(attendanceData).length === 0}
              >
                {saving ? (
                  <>
                    <span className="btn-spinner"></span> Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Attendance
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;