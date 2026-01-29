import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaEnvelope, FaLock } from 'react-icons/fa';
import "../styles/Login.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      
      // Navigate based on user role
      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user?.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@school.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        email: 'john@school.com',
        password: 'teacher123'
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaGraduationCap />
          </div>
          <h1 className="login-title">AttendEase</h1>
          <p className="login-subtitle">Student Attendance Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label">
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              name="email"
              className="login-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label">
              <FaLock /> Password
            </label>
            <input
              type="password"
              name="password"
              className="login-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner"></span> Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

       <div className="login-footer">
          <div className="login-demo-box">
            <h4 className="login-demo-title">Demo Credentials</h4>
            <p className="login-demo-item">
              <strong>Admin:</strong> admin@school.com / admin123 
              <button 
                type="button" 
                className="login-fill-btn" 
                onClick={() => fillDemoCredentials('admin')}
              >
                Fill
              </button>
            </p>
            <p className="login-demo-item">
              <strong>Teacher:</strong> john@school.com / teacher123 
              <button 
                type="button" 
                className="login-fill-btn" 
                onClick={() => fillDemoCredentials('teacher')}
              >
                Fill
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;