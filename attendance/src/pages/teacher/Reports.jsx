import { useState, useEffect } from 'react';
import { attendanceAPI, studentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaChartBar, 
  FaDownload, 
  FaCalendar, 
  FaFilter,
  FaSearch,
  FaFileExport
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { 
  formatDisplayDate, 
  getMonthName, 
  downloadCSV, 
  getTodayDate, 
  getFirstDayOfMonth 
} from '../../utils/helpers';
import './Reports.css';

const TeacherReports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startDate: getFirstDayOfMonth(),
    endDate: getTodayDate()
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (reportType === 'monthly') {
      fetchMonthlySummary();
    }
  }, [reportType, filters.month, filters.year]);

  const fetchStudents = async () => {
    try {
      const { data } = await studentAPI.getByTeacher(user._id);
      setStudents(data.students || []);
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      const { data } = await attendanceAPI.getMonthlySummary({
        month: filters.month,
        year: filters.year,
        teacherId: user._id
      });
      setMonthlySummary(data.summary || []);
    } catch (error) {
      toast.error('Failed to fetch monthly summary');
      setMonthlySummary([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    try {
      setLoading(true);
      const { data } = await attendanceAPI.getByStudent(selectedStudent, {
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setStudentAttendance(data);
    } catch (error) {
      toast.error('Failed to fetch student attendance');
      setStudentAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        teacherId: user._id
      };

      if (reportType === 'student' && selectedStudent) {
        params.studentId = selectedStudent;
      }

      const response = await attendanceAPI.exportCSV(params);
      downloadCSV(response.data, `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="teacher-reports">
      <div className="reports-container">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h1 className="reports-title">
              <FaChartBar /> Attendance Reports
            </h1>
            <p className="reports-subtitle">View attendance reports for your students</p>
          </div>
          <button className="export-btn" onClick={handleExportCSV}>
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Report Type Selection */}
        <div className="report-type-section">
          <div className="type-selector">
            <button
              className={`type-btn ${reportType === 'monthly' ? 'active' : ''}`}
              onClick={() => setReportType('monthly')}
            >
              <FaCalendar /> Monthly Summary
            </button>
            <button
              className={`type-btn ${reportType === 'student' ? 'active' : ''}`}
              onClick={() => setReportType('student')}
            >
              <FaSearch /> Student Report
            </button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="filters-card">
          <div className="filters-header">
            <h3 className="filters-title">
              <FaFilter /> Filters
            </h3>
          </div>
          
          {reportType === 'monthly' ? (
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Month</label>
                <select
                  name="month"
                  className="filter-select"
                  value={filters.month}
                  onChange={handleFilterChange}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Year</label>
                <select
                  name="year"
                  className="filter-select"
                  value={filters.year}
                  onChange={handleFilterChange}
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ) : (
            <div className="filters-grid">
              <div className="filter-group filter-group-full">
                <label className="filter-label">Student</label>
                <select
                  className="filter-select"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.studentId}) - {student.class}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="filter-input"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="filter-input"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group filter-group-button">
                <button className="generate-btn" onClick={fetchStudentReport}>
                  <FaFileExport /> Generate Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="reports-loading">
            <div className="reports-spinner"></div>
            <p>Loading report data...</p>
          </div>
        ) : (
          <>
            {reportType === 'monthly' && (
              <div className="report-content">
                <div className="report-header-bar">
                  <h2 className="report-content-title">
                    {getMonthName(filters.month)} {filters.year} Summary
                  </h2>
                  <div className="report-count">
                    {monthlySummary.length} students
                  </div>
                </div>

                {monthlySummary.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3 className="empty-title">No attendance data</h3>
                    <p className="empty-text">No attendance records found for the selected period</p>
                  </div>
                ) : (
                  <div className="report-table-container">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Class</th>
                          <th>Present</th>
                          <th>Absent</th>
                          <th>Total</th>
                          <th>Attendance %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlySummary.map((record) => (
                          <tr key={record.student._id}>
                            <td>
                              <span className="table-student-id">{record.student.studentId}</span>
                            </td>
                            <td>
                              <div className="table-student-info">
                                <div className="table-avatar">
                                  {record.student.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="table-student-name">{record.student.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="table-badge badge-class">
                                {record.student.class} {record.student.section && `- ${record.student.section}`}
                              </span>
                            </td>
                            <td>
                              <span className="table-badge badge-success">{record.present}</span>
                            </td>
                            <td>
                              <span className="table-badge badge-danger">{record.absent}</span>
                            </td>
                            <td>
                              <span className="table-total">{record.total}</span>
                            </td>
                            <td>
                              <div className="table-percentage">
                                <div className="percentage-bar-wrapper">
                                  <div 
                                    className={`percentage-bar-fill ${record.presentPercentage >= 75 ? 'good' : 'low'}`}
                                    style={{ width: `${record.presentPercentage}%` }}
                                  ></div>
                                </div>
                                <span className={`percentage-value ${record.presentPercentage >= 75 ? 'good' : 'low'}`}>
                                  {record.presentPercentage}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {reportType === 'student' && studentAttendance && (
              <div className="report-content">
                {/* Student Info Card */}
                <div className="student-info-card">
                  <div className="student-info-header">
                    <div className="student-info-avatar">
                      {studentAttendance.student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-info-details">
                      <h2 className="student-info-name">{studentAttendance.student.name}</h2>
                      <p className="student-info-meta">
                        {studentAttendance.student.studentId} • {studentAttendance.student.class}
                      </p>
                    </div>
                  </div>

                  <div className="student-stats-grid">
                    <div className="student-stat">
                      <div className="student-stat-label">Class</div>
                      <div className="student-stat-value">{studentAttendance.student.class}</div>
                    </div>
                    <div className="student-stat">
                      <div className="student-stat-label">Total Days</div>
                      <div className="student-stat-value">{studentAttendance.summary.total}</div>
                    </div>
                    <div className="student-stat">
                      <div className="student-stat-label">Present</div>
                      <div className="student-stat-value success">{studentAttendance.summary.present}</div>
                    </div>
                    <div className="student-stat">
                      <div className="student-stat-label">Absent</div>
                      <div className="student-stat-value danger">{studentAttendance.summary.absent}</div>
                    </div>
                    <div className="student-stat">
                      <div className="student-stat-label">Attendance</div>
                      <div className={`student-stat-value ${studentAttendance.summary.presentPercentage >= 75 ? 'success' : 'danger'}`}>
                        {studentAttendance.summary.presentPercentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Records */}
                {studentAttendance.attendance.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3 className="empty-title">No attendance records</h3>
                    <p className="empty-text">No attendance found for the selected date range</p>
                  </div>
                ) : (
                  <div className="report-table-container">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAttendance.attendance.map((record) => (
                          <tr key={record._id}>
                            <td>
                              <div className="table-date">
                                <FaCalendar />
                                <span>{formatDisplayDate(record.date)}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge status-${record.status}`}>
                                {record.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <span className="table-remarks">{record.remarks || '-'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherReports;