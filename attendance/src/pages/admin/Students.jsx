import { useState, useEffect } from 'react';
import { studentAPI, teacherAPI } from '../../utils/api';
import { 
  FaUserGraduate, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaTimes,
  FaFilter,
  FaEye
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Students.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    class: '',
    section: '',
    rollNumber: '',
    assignedTeacher: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, [pagination.page, searchTerm, classFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data } = await studentAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        class: classFilter
      });
      setStudents(data.students);
      setPagination({
        ...pagination,
        total: data.total,
        pages: data.pages
      });
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await teacherAPI.getAll({ limit: 1000 });
      setTeachers(data.teachers);
    } catch (error) {
      console.error('Failed to fetch teachers');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      email: '',
      phone: '',
      class: '',
      section: '',
      rollNumber: '',
      assignedTeacher: '',
      dateOfBirth: '',
      address: '',
      parentName: '',
      parentPhone: ''
    });
    setIsEditing(false);
    setSelectedStudent(null);
  };

  const handleOpenModal = (student = null) => {
    if (student) {
      setIsEditing(true);
      setSelectedStudent(student);
      setFormData({
        studentId: student.studentId || '',
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        class: student.class || '',
        section: student.section || '',
        rollNumber: student.rollNumber || '',
        assignedTeacher: student.assignedTeacher?._id || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        address: student.address || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await studentAPI.update(selectedStudent._id, formData);
        toast.success('Student updated successfully');
      } else {
        await studentAPI.create(formData);
        toast.success('Student created successfully');
      }
      
      handleCloseModal();
      fetchStudents();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      await studentAPI.delete(id);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  return (
    <div className="admin-students">
      <div className="students-container">
        {/* Header */}
        <div className="students-header">
          <div>
            <h1 className="students-title">
              <FaUserGraduate /> Students Management
            </h1>
            <p className="students-subtitle">Manage all students in the system</p>
          </div>
          <button className="add-student-btn" onClick={() => handleOpenModal()}>
            <FaPlus /> Add Student
          </button>
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
            <FaFilter className="filter-icon" />
            <input
              type="text"
              className="filter-input"
              placeholder="Filter by class..."
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="students-loading">
            <div className="students-spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">No students found</h3>
            <p className="empty-text">
              {searchTerm || classFilter 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first student'}
            </p>
            {!searchTerm && !classFilter && (
              <button className="empty-add-btn" onClick={() => handleOpenModal()}>
                <FaPlus /> Add Student
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="students-table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Roll No.</th>
                    <th>Teacher</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <span className="student-id-badge">{student.studentId}</span>
                      </td>
                      <td>
                        <div className="student-info">
                          <div className="student-avatar">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="student-name">{student.name}</div>
                            <div className="student-phone">{student.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="student-email">{student.email}</span>
                      </td>
                      <td>
                        <span className="class-badge">
                          {student.class} {student.section && `- ${student.section}`}
                        </span>
                      </td>
                      <td>
                        <span className="roll-number">{student.rollNumber || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="teacher-name">
                          {student.assignedTeacher?.name || 'Not Assigned'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewStudent(student)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleOpenModal(student)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(student._id)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <div className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    className="form-input"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Class *</label>
                  <input
                    type="text"
                    name="class"
                    className="form-input"
                    placeholder="e.g., 10"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    name="section"
                    className="form-input"
                    placeholder="e.g., A"
                    value={formData.section}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    className="form-input"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Teacher</label>
                  <select
                    name="assignedTeacher"
                    className="form-select"
                    value={formData.assignedTeacher}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Name</label>
                  <input
                    type="text"
                    name="parentName"
                    className="form-input"
                    value={formData.parentName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    className="form-input"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-textarea"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              <div className="view-details">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedStudent.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedStudent.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Class:</span>
                  <span className="detail-value">
                    {selectedStudent.class} {selectedStudent.section && `- ${selectedStudent.section}`}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Roll Number:</span>
                  <span className="detail-value">{selectedStudent.rollNumber || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Assigned Teacher:</span>
                  <span className="detail-value">
                    {selectedStudent.assignedTeacher?.name || 'Not Assigned'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date of Birth:</span>
                  <span className="detail-value">
                    {selectedStudent.dateOfBirth 
                      ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Parent Name:</span>
                  <span className="detail-value">{selectedStudent.parentName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Parent Phone:</span>
                  <span className="detail-value">{selectedStudent.parentPhone || 'N/A'}</span>
                </div>
                <div className="detail-row detail-row-full">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{selectedStudent.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;