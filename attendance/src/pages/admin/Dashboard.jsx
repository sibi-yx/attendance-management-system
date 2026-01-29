import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../utils/api';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaCheckCircle, 
  FaTimesCircle,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Dashboard.css';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardAPI.getAdminDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <FaExclamationTriangle />
        <p>Failed to load dashboard data</p>
        <button className="dashboard-retry-btn" onClick={fetchDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const {
    totalStudents = 0,
    totalTeachers = 0,
    todayPresent = 0,
    todayAbsent = 0,
    todayTotal = 0,
    monthlySummary = [],
    classWiseDistribution = [],
    recentActivities = [],
    lowAttendanceStudents = []
  } = dashboardData;

  const todayAttendancePercentage = todayTotal > 0 
    ? ((todayPresent / todayTotal) * 100).toFixed(1) 
    : 0;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">Overview of your school's attendance system</p>
          </div>
          <div className="dashboard-date">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card stat-card-students">
            <div className="stat-icon">
              <FaUserGraduate />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{totalStudents}</h3>
              <p className="stat-label">Total Students</p>
            </div>
          </div>

          <div className="stat-card stat-card-teachers">
            <div className="stat-icon">
              <FaChalkboardTeacher />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{totalTeachers}</h3>
              <p className="stat-label">Total Teachers</p>
            </div>
          </div>

          <div className="stat-card stat-card-present">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{todayPresent}</h3>
              <p className="stat-label">Present Today</p>
            </div>
          </div>

          <div className="stat-card stat-card-absent">
            <div className="stat-icon">
              <FaTimesCircle />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{todayAbsent}</h3>
              <p className="stat-label">Absent Today</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance Overview */}
        <div className="dashboard-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <FaChartLine /> Today's Attendance
              </h2>
            </div>
            <div className="section-body">
              <div className="attendance-overview">
                <div className="attendance-circle">
                  <svg className="attendance-svg" viewBox="0 0 200 200">
                    <circle
                      className="attendance-bg"
                      cx="100"
                      cy="100"
                      r="80"
                    />
                    <circle
                      className="attendance-progress"
                      cx="100"
                      cy="100"
                      r="80"
                      strokeDasharray={`${(todayAttendancePercentage / 100) * 502.65} 502.65`}
                    />
                  </svg>
                  <div className="attendance-percentage">
                    <span className="percentage-value">{todayAttendancePercentage}%</span>
                    <span className="percentage-label">Attendance</span>
                  </div>
                </div>

                <div className="attendance-details">
                  <div className="attendance-detail-item">
                    <div className="detail-indicator detail-present"></div>
                    <div className="detail-info">
                      <span className="detail-label">Present</span>
                      <span className="detail-value">{todayPresent} students</span>
                    </div>
                  </div>
                  <div className="attendance-detail-item">
                    <div className="detail-indicator detail-absent"></div>
                    <div className="detail-info">
                      <span className="detail-label">Absent</span>
                      <span className="detail-value">{todayAbsent} students</span>
                    </div>
                  </div>
                  <div className="attendance-detail-item">
                    <div className="detail-indicator detail-total"></div>
                    <div className="detail-info">
                      <span className="detail-label">Total</span>
                      <span className="detail-value">{todayTotal} students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-grid">
          {/* Monthly Summary */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Monthly Summary</h2>
            </div>
            <div className="section-body">
              {monthlySummary.length === 0 ? (
                <div className="empty-state">
                  <p>No attendance data available</p>
                </div>
              ) : (
                <div className="monthly-summary-list">
                  {monthlySummary.slice(0, 5).map((record, index) => (
                    <div key={index} className="summary-item">
                      <div className="summary-student">
                        <div className="student-avatar">
                          {record.student?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-info">
                          <p className="student-name">{record.student?.name}</p>
                          <p className="student-class">{record.student?.class}</p>
                        </div>
                      </div>
                      <div className="summary-stats">
                        <div className="summary-stat">
                          <span className="stat-count present-count">{record.present}</span>
                          <span className="stat-type">Present</span>
                        </div>
                        <div className="summary-stat">
                          <span className="stat-count absent-count">{record.absent}</span>
                          <span className="stat-type">Absent</span>
                        </div>
                        <div className="summary-percentage">
                          <div className="percentage-bar">
                            <div 
                              className="percentage-fill"
                              style={{ width: `${record.presentPercentage}%` }}
                            ></div>
                          </div>
                          <span className="percentage-text">{record.presentPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Class-wise Distribution */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Class-wise Distribution</h2>
            </div>
            <div className="section-body">
              {classWiseDistribution.length === 0 ? (
                <div className="empty-state">
                  <p>No class data available</p>
                </div>
              ) : (
                <div className="class-distribution">
                  {classWiseDistribution.map((classData, index) => (
                    <div key={index} className="class-item">
                      <div className="class-header">
                        <span className="class-name">{classData._id}</span>
                        <span className="class-count">{classData.count} students</span>
                      </div>
                      <div className="class-bar">
                        <div 
                          className="class-bar-fill"
                          style={{ 
                            width: `${(classData.count / totalStudents) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Low Attendance Alert */}
        {lowAttendanceStudents && lowAttendanceStudents.length > 0 && (
          <div className="dashboard-section">
            <div className="section-card alert-card">
              <div className="section-header">
                <h2 className="section-title">
                  <FaExclamationTriangle /> Low Attendance Alert
                </h2>
                <span className="alert-badge">{lowAttendanceStudents.length} students</span>
              </div>
              <div className="section-body">
                <div className="alert-list">
                  {lowAttendanceStudents.map((student, index) => (
                    <div key={index} className="alert-item">
                      <div className="alert-student">
                        <div className="student-avatar alert-avatar">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-info">
                          <p className="student-name">{student.name}</p>
                          <p className="student-details">
                            {student.studentId} • {student.class}
                          </p>
                        </div>
                      </div>
                      <div className="alert-percentage">
                        <span className="percentage-value danger">
                          {student.attendancePercentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="dashboard-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Recent Activities</h2>
            </div>
            <div className="section-body">
              {recentActivities && recentActivities.length === 0 ? (
                <div className="empty-state">
                  <p>No recent activities</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentActivities && recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.status === 'present' ? 'activity-present' : 'activity-absent'}`}>
                        {activity.status === 'present' ? <FaCheckCircle /> : <FaTimesCircle />}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>{activity.student?.name}</strong> marked {activity.status}
                        </p>
                        <p className="activity-meta">
                          {activity.student?.class} • {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="activity-teacher">
                        <span>by {activity.teacher?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;