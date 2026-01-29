import { useState, useEffect } from 'react';
import { dashboardAPI, attendanceAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUserGraduate, 
  FaCheckCircle, 
  FaTimesCircle,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../../utils/helpers';
import './Dashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await dashboardAPI.getTeacherDashboard();
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
    todayPresent = 0,
    todayAbsent = 0,
    todayTotal = 0,
    recentAttendance = [],
    lowAttendanceStudents = [],
    classSummary = []
  } = dashboardData;

  const todayAttendancePercentage = todayTotal > 0 
    ? ((todayPresent / todayTotal) * 100).toFixed(1) 
    : 0;

  const notMarkedToday = totalStudents - todayTotal;

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
            <p className="dashboard-subtitle">Here's an overview of your students' attendance</p>
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
              <p className="stat-label">Assigned Students</p>
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

          <div className="stat-card stat-card-pending">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{notMarkedToday}</h3>
              <p className="stat-label">Not Marked Today</p>
            </div>
          </div>
        </div>

        {/* Today's Attendance Overview */}
        <div className="dashboard-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <FaChartLine /> Today's Attendance Overview
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
                    <div className="detail-indicator detail-pending"></div>
                    <div className="detail-info">
                      <span className="detail-label">Not Marked</span>
                      <span className="detail-value">{notMarkedToday} students</span>
                    </div>
                  </div>
                  <div className="attendance-detail-item">
                    <div className="detail-indicator detail-total"></div>
                    <div className="detail-info">
                      <span className="detail-label">Total</span>
                      <span className="detail-value">{totalStudents} students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="dashboard-grid">
          {/* Class Summary */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Class Distribution</h2>
            </div>
            <div className="section-body">
              {classSummary && classSummary.length === 0 ? (
                <div className="empty-state">
                  <p>No class data available</p>
                </div>
              ) : (
                <div className="class-distribution">
                  {classSummary && classSummary.map((classData, index) => (
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

          {/* Recent Attendance */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
            </div>
            <div className="section-body">
              {recentAttendance.length === 0 ? (
                <div className="empty-state">
                  <p>No recent attendance records</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentAttendance.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.status === 'present' ? 'activity-present' : 'activity-absent'}`}>
                        {activity.status === 'present' ? <FaCheckCircle /> : <FaTimesCircle />}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>{activity.student?.name}</strong> marked {activity.status}
                        </p>
                        <p className="activity-meta">
                          {activity.student?.class} • {formatDisplayDate(activity.date)}
                        </p>
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
                        <span className="percentage-label-small">Attendance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="section-body">
              <div className="quick-actions-grid">
                <a href="/teacher/attendance" className="quick-action-card">
                  <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <FaCheckCircle />
                  </div>
                  <div className="quick-action-content">
                    <h3 className="quick-action-title">Mark Attendance</h3>
                    <p className="quick-action-desc">Mark today's attendance</p>
                  </div>
                </a>

                <a href="/teacher/students" className="quick-action-card">
                  <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <FaUserGraduate />
                  </div>
                  <div className="quick-action-content">
                    <h3 className="quick-action-title">View Students</h3>
                    <p className="quick-action-desc">See all assigned students</p>
                  </div>
                </a>

                <a href="/teacher/reports" className="quick-action-card">
                  <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <FaChartLine />
                  </div>
                  <div className="quick-action-content">
                    <h3 className="quick-action-title">View Reports</h3>
                    <p className="quick-action-desc">Generate attendance reports</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;