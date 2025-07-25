import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardPage from '../Pages/DashboardPage';
import UsersPage from '../Pages/UsersPage';
import RoomsPage from '../Pages/RoomsPage';
import BookingsPage from '../Pages/BookingsPage';
import ReviewsPage from '../Pages/ReviewsPage';
import AnalyticsPage from '../Pages/AnalyticsPage';
import SecurityPage from '../Pages/SecurityPage';
import SettingsPage from '../Pages/SettingsPage';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'users':
        return <UsersPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'security':
        return <SecurityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-cyan-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
        />
        
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm bg-white/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;