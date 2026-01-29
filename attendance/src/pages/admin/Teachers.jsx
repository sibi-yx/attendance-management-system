import { useState, useEffect } from 'react';
import { teacherAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaChalkboardTeacher, 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaBook,
  FaUser
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Teachers.css';

const AdminTeachers = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    subject: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, [searchTerm]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data } = await teacherAPI.getAll({ search: searchTerm });
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Fetch teachers error:', error);
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
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
      name: '',
      email: '',
      password: '',
      phone: '',
      subject: ''
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    
    console.log('Submitting teacher data:', formData);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await teacherAPI.create(formData);
      
      console.log('Teacher created response:', response);
      
      toast.success('Teacher added successfully');
      setShowAddModal(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Add teacher error:', error);
      console.error('Error response:', error.response);
      
      const message = error.response?.data?.message || 'Failed to add teacher';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = async (e) => {
    e.preventDefault();
    
    console.log('Updating teacher:', selectedTeacher._id, 'with data:', formData);

    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // If password is empty, remove it from the update
    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      setLoading(true);
      await teacherAPI.update(selectedTeacher._id, updateData);
      toast.success('Teacher updated successfully');
      setShowEditModal(false);
      resetForm();
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (error) {
      console.error('Update teacher error:', error);
      const message = error.response?.data?.message || 'Failed to update teacher';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await teacherAPI.delete(teacher._id);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      console.error('Delete teacher error:', error);
      const message = error.response?.data?.message || 'Failed to delete teacher';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '', // Don't populate password
      phone: teacher.phone || '',
      subject: teacher.subject || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (teacher) => {
    setSelectedTeacher(teacher);
    setShowViewModal(true);
  };

  return (
    <div className="admin-teachers">
      <div className="teachers-container">
        {/* Header */}
        <div className="teachers-header">
          <div>
            <h1 className="teachers-title">
              <FaChalkboardTeacher /> Teachers Management
            </h1>
            <p className="teachers-subtitle">Manage all teachers in the system</p>
          </div>
          <button className="add-teacher-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Teacher
          </button>
        </div>

        {/* Search Bar */}
        <div className="teachers-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="teachers-loading">
            <div className="teachers-spinner"></div>
            <p>Loading teachers...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🏫</div>
            <h3 className="empty-title">No Teachers Found</h3>
            <p className="empty-text">
              {searchTerm ? 'Try adjusting your search' : 'Click "Add Teacher" to create your first teacher'}
            </p>
          </div>
        ) : (
          <div className="teachers-grid">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="teacher-card">
                <div className="teacher-card-header">
                  <div className="teacher-avatar">
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="teacher-card-actions">
                    <button 
                      className="action-btn view-btn" 
                      onClick={() => openViewModal(teacher)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => openEditModal(teacher)}
                      title="Edit Teacher"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteTeacher(teacher)}
                      title="Delete Teacher"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="teacher-card-body">
                  <h3 className="teacher-name">{teacher.name}</h3>
                  
                  <div className="teacher-info">
                    <div className="info-item">
                      <FaBook className="info-icon" />
                      <span className="info-text">{teacher.subject || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <span className="info-text">{teacher.email}</span>
                    </div>
                    <div className="info-item">
                      <FaPhone className="info-icon" />
                      <span className="info-text">{teacher.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="teacher-card-footer">
                  <span className={`status-badge ${teacher.isActive ? 'active' : 'inactive'}`}>
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="student-count">0 Students</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Teacher</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAddTeacher}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter teacher name"
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
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Enter password (min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    placeholder="Enter subject taught"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="modal-btn cancel-btn" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-btn submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {showEditModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Teacher</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleEditTeacher}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter teacher name"
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
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="Leave blank to keep current password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <small className="form-hint">Leave blank to keep current password</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    placeholder="Enter subject taught"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="modal-btn cancel-btn" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-btn submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {showViewModal && selectedTeacher && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Teacher Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="view-content">
              <div className="view-header">
                <div className="view-avatar">
                  {selectedTeacher.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="view-name">{selectedTeacher.name}</h3>
                  <span className={`status-badge ${selectedTeacher.isActive ? 'active' : 'inactive'}`}>
                    {selectedTeacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="view-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <FaEnvelope /> Email:
                  </span>
                  <span className="detail-value">{selectedTeacher.email}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaPhone /> Phone:
                  </span>
                  <span className="detail-value">{selectedTeacher.phone || 'Not provided'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaBook /> Subject:
                  </span>
                  <span className="detail-value">{selectedTeacher.subject || 'Not specified'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">
                    <FaUser /> Role:
                  </span>
                  <span className="detail-value">{selectedTeacher.role}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">
                    {new Date(selectedTeacher.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;