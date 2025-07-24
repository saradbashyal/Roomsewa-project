import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Header = ({ sidebarOpen, setSidebarOpen, activeTab }) => {
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      users: 'User Management',
      rooms: 'Room Management',
      bookings: 'Booking Management', 
      reviews: 'Review Management',
      analytics: 'Analytics',
      security: 'Security',
      settings: 'Settings'
    };
    return titles[activeTab] || 'Dashboard';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
          >
            <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;