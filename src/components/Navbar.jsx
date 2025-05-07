import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-gray-200 p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl text-gray-100 hover:text-gray-300">LearnSphere</Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'Student' && (
                <>
                  <Link to="/studentdashboard" className="hover:text-gray-300">All Courses</Link>
                  <Link to="/enrolled-courses" className="hover:text-gray-300">Enrolled Courses</Link>
                
                </>
              )}

              {user.role === 'Instructor' && (
                <>
                  <Link to="/dashboard" className="hover:text-gray-300">Manage Courses</Link>
                  <Link to="/statastics" className="hover:text-gray-300">Dashboard</Link>
                </>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
                >
                  {user.name} ▼
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 bg-gray-800 text-gray-200 rounded shadow-lg w-40 z-50">
                   
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;