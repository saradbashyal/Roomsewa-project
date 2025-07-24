import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faChevronDown, 
  faSignOutAlt, 
  faList, 
  faBookmark 
} from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';


function Navbar({ userId, userName, userEmail, userRole }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  // Load user data on component mount and listen for changes
  useEffect(() => {
    const updateUser = () => {
      const userData = getUserData();
      if (userData) {
        setUser(userData);
      } else if (userId) {
        // Fallback to props if localStorage is empty but props are provided
        setUser({
          name: userName,
          username: userName,
          email: userEmail,
          role: userRole || 'user'
        });
      } else {
        setUser(null);
      }
    };

    // Initial load
    updateUser();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    // Listen for localStorage changes
    const handleStorageChange = () => {
      updateUser();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Custom event for immediate updates (like after login)
    window.addEventListener('userDataChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId, userName, userEmail, userRole]);

  const handleLogout = () => {
    // Clear all authentication data
    ['user', 'token', 'userId', 'userName', 'userEmail'].forEach(key => 
      localStorage.removeItem(key)
    );
    
    setUser(null);
    setShowDropdown(false);
    toast.success('Logged out successfully');
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userDataChanged'));
    window.location.reload();
  };

  const handleUserNavigation = (path) => {
    setShowDropdown(false);
    navigate(path);
  };

  const handleMyListings = () => {
    if (user?.role === 'landlord' || user?.role === 'admin') {
      handleUserNavigation('/my-listings');
    }
  };

  const handleMyBookings = () => {
    handleUserNavigation('/my-bookings');
  };

  return (
    <>
      <>
        <nav className="flex items-center w-full justify-between bg-cyan-600 text-white		 p-[20px] md:px-8 lg:px-28 py-3 fixed lg:py-6 z-10 shadow-sm">
          <img src={logo} alt="logo" className="h-[50px] w-[50px] object-cover scale-200 translate-y-2" />
          <ul className="flex gap-[30px]">
            <li>
              <NavLink
                to={"/"}
                className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/about-us"}
                className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
              >
                About us
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/FAQs"}
                className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
              >
                FAQs
              </NavLink>
            </li>
            <li>
              <NavLink
                to={"/support"}
                className="hover:text-cyan-200 hover:scale-105 transition-all duration-200"
              >
                Contact us
              </NavLink>
            </li>
          </ul>
          {user ? (
            <div className="relative user-dropdown-container">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-xl px-4 py-2 hover:bg-cyan-50 transition-all duration-200"
              >
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-900">
                    {user.name || user.username || 'User'}
                  </span>
                  <span className="text-xs text-cyan-600 capitalize">{user.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                  </div>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`text-gray-500 text-xs transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.name || user.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email || 'No email provided'}
                    </p>
                    <p className="text-xs text-cyan-600 capitalize font-medium">
                      {user.role} Account
                    </p>
                  </div>
                  
                  <div className="py-2">
                    {(user.role === 'landlord' || user.role === 'admin') && (
                      <button
                        onClick={handleMyListings}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faList} className="text-cyan-600" />
                        <span className="text-sm text-gray-700">My Listings</span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleMyBookings}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faBookmark} className="text-cyan-600" />
                      <span className="text-sm text-gray-700">My Bookings</span>
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="text-red-500" />
                        <span className="text-sm text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-cyan-200 rounded-xl px-4 py-2 hover:bg-cyan-50 transition-all duration-200"
            >
              <FontAwesomeIcon icon={faUser} className="text-cyan-600" />
              <span className="text-sm font-medium text-gray-700">Login</span>
            </Link>
          )}
        </nav>
      </>
    </>
  );
}
export default Navbar;
