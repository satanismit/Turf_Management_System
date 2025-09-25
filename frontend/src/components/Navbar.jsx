import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      setIsLoggedIn(!!token);
      setUser(userData ? JSON.parse(userData) : null);
    };

    checkLogin();

    window.addEventListener('storage', checkLogin);
    window.addEventListener('authChange', checkLogin);

    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('authChange', checkLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="flex items-center">
            <Link to="/" className="navbar-brand">
              TurfManager
            </Link>
          </div>
          <div className="navbar-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link
              to="/turfs"
              className="nav-link"
            >
              Turfs
            </Link>
            {isLoggedIn && (
              <Link
                to="/my-bookings"
                className="nav-link"
              >
                My Bookings
              </Link>
            )}
            {isLoggedIn && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="nav-link font-semibold"
              >
                Admin Dashboard
              </Link>
            )}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="nav-link"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="nav-button"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="nav-button-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
