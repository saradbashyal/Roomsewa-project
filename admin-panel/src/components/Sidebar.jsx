import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers, 
  faBuilding, 
  faCalendar, 
  faChartBar, 
  faCog, 
  faTimes, 
  faCommentDots, 
  faShield 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: faHome },
    { id: 'users', label: 'Users', icon: faUsers },
    { id: 'rooms', label: 'Rooms', icon: faBuilding },
    { id: 'bookings', label: 'Bookings', icon: faCalendar },
    { id: 'reviews', label: 'Reviews', icon: faCommentDots },
    { id: 'analytics', label: 'Analytics', icon: faChartBar },
    { id: 'security', label: 'Security', icon: faShield },
    { id: 'settings', label: 'Settings', icon: faCog },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-cyan-600">RoomSewa</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-cyan-50 transition-colors ${
              activeTab === item.id ? 'bg-cyan-50 text-cyan-700 border-r-2 border-cyan-700' : 'text-gray-700'
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;