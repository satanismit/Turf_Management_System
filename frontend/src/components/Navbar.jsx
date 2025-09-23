import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              TurfManager
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:text-green-200 transition-colors">
              Home
            </Link>
            <Link to="/turfs" className="hover:text-green-200 transition-colors">
              Turfs
            </Link>
            {isLoggedIn && (
              <Link to="/my-bookings" className="hover:text-green-200 transition-colors">
                My Bookings
              </Link>
            )}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="hover:text-green-200 transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="bg-green-700 hover:bg-green-800 px-3 py-1 rounded transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-green-600 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
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
