import { useState, useEffect } from 'react';
import { studentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUserGraduate, 
  FaSearch,
  FaEye,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaIdCard,
  FaChalkboard,
  FaUser
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Students.css';

const TeacherStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, classFilter, students]);

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

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter) {
      filtered = filtered.filter(student =>
        student.class.toLowerCase().includes(classFilter.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(students.map(s => s.class))];
    return classes.sort();
  };

  return (
    <div className="teacher-students">
      <div className="students-container">
        {/* Header */}
        <div className="students-header">
          <div>
            <h1 className="students-title">
              <FaUserGraduate /> My Students
            </h1>
            <p className="students-subtitle">View all students assigned to you</p>
          </div>
          <div className="students-count-badge">
            {filteredStudents.length} {filteredStudents.length === 1 ? 'Student' : 'Students'}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="students-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <FaChalkboard className="filter-icon" />
            <select
              className="filter-select"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {getUniqueClasses().map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="students-loading">
            <div className="students-spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">
              {searchTerm || classFilter ? 'No students found' : 'No Students Assigned'}
            </h3>
            <p className="empty-text">
              {searchTerm || classFilter 
                ? 'Try adjusting your search or filters' 
                : 'You don\'t have any students assigned to you yet'}
            </p>
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map((student) => (
              <div key={student._id} className="student-card">
                <div className="student-card-header">
                  <div className="student-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    className="view-details-btn"
                    onClick={() => handleViewStudent(student)}
                  >
                    <FaEye /> View Details
                  </button>
                </div>

                <div className="student-card-body">
                  <h3 className="student-name">{student.name}</h3>
                  <div className="student-id-badge">{student.studentId}</div>

                  <div className="student-info-list">
                    <div className="info-item">
                      <FaChalkboard className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Class</span>
                        <span className="info-value">
                          {student.class} {student.section && `- ${student.section}`}
                        </span>
                      </div>
                    </div>

                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Email</span>
                        <span className="info-value">{student.email}</span>
                      </div>
                    </div>

                    <div className="info-item">
                      <FaPhone className="info-icon" />
                      <div className="info-content">
                        <span className="info-label">Phone</span>
                        <span className="info-value">{student.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {student.rollNumber && (
                      <div className="info-item">
                        <FaIdCard className="info-icon" />
                        <div className="info-content">
                          <span className="info-label">Roll No.</span>
                          <span className="info-value">{student.rollNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="student-card-footer">
                  {student.parentName && (
                    <div className="parent-info">
                      <FaUser className="parent-icon" />
                      <span className="parent-text">{student.parentName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Student Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="view-content">
              <div className="view-header">
                <div className="view-avatar">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="view-name">{selectedStudent.name}</h3>
                  <p className="view-id">{selectedStudent.studentId}</p>
                </div>
              </div>

              <div className="view-sections">
                {/* Personal Information */}
                <div className="view-section">
                  <h4 className="section-title">Personal Information</h4>
                  <div className="view-details">
                    <div className="detail-row">
                      <span className="detail-label">
                        <FaIdCard /> Student ID:
                      </span>
                      <span className="detail-value">{selectedStudent.studentId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FaEnvelope /> Email:
                      </span>
                      <span className="detail-value">{selectedStudent.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FaPhone /> Phone:
                      </span>
                      <span className="detail-value">{selectedStudent.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FaBirthdayCake /> Date of Birth:
                      </span>
                      <span className="detail-value">
                        {selectedStudent.dateOfBirth 
                          ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    {selectedStudent.address && (
                      <div className="detail-row detail-row-full">
                        <span className="detail-label">
                          <FaMapMarkerAlt /> Address:
                        </span>
                        <span className="detail-value">{selectedStudent.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div className="view-section">
                  <h4 className="section-title">Academic Information</h4>
                  <div className="view-details">
                    <div className="detail-row">
                      <span className="detail-label">
                        <FaChalkboard /> Class:
                      </span>
                      <span className="detail-value">
                        {selectedStudent.class} {selectedStudent.section && `- ${selectedStudent.section}`}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FaIdCard /> Roll Number:
                      </span>
                      <span className="detail-value">{selectedStudent.rollNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                {(selectedStudent.parentName || selectedStudent.parentPhone) && (
                  <div className="view-section">
                    <h4 className="section-title">Parent/Guardian Information</h4>
                    <div className="view-details">
                      <div className="detail-row">
                        <span className="detail-label">
                          <FaUser /> Name:
                        </span>
                        <span className="detail-value">{selectedStudent.parentName || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">
                          <FaPhone /> Phone:
                        </span>
                        <span className="detail-value">{selectedStudent.parentPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;