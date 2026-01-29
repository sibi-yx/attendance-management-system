import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaGraduationCap, 
  FaTachometerAlt, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaClipboardCheck, 
  FaChartBar, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes 
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link 
          to={isAdmin ? '/admin/dashboard' : '/teacher/dashboard'} 
          className="navbar-brand"
          onClick={closeMobileMenu}
        >
          <div className="navbar-logo">
            <FaGraduationCap />
          </div>
          <span className="navbar-title">AttendEase</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Links */}
        <ul className={`navbar-nav ${mobileMenuOpen ? 'active' : ''}`}>
          {isAdmin ? (
            <>
              <li className="nav-item">
                <NavLink 
                  to="/admin/dashboard" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaTachometerAlt /> Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/admin/teachers" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaChalkboardTeacher /> Teachers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/admin/students" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaUserGraduate /> Students
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/admin/reports" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaChartBar /> Reports
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink 
                  to="/teacher/dashboard" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaTachometerAlt /> Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/teacher/students" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaUserGraduate /> Students
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/teacher/attendance" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaClipboardCheck /> Attendance
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink 
                  to="/teacher/reports" 
                  className="nav-link"
                  onClick={closeMobileMenu}
                >
                  <FaChartBar /> Reports
                </NavLink>
              </li>
            </>
          )}
          
          {/* User Info */}
          <li className="nav-item nav-item-user">
            <div className="navbar-user">
              <div className="user-avatar">
                {getInitials(user?.name)}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name || 'User'}</div>
                <div className="user-role">{user?.role || 'Role'}</div>
              </div>
            </div>
          </li>
          
          {/* Logout Button */}
          <li className="nav-item">
            <button 
              className="navbar-logout" 
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;