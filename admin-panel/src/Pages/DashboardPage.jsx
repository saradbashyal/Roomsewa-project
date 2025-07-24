import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faBuilding, 
  faCalendar, 
  faArrowTrendUp, 
  faDollarSign, 
  faStar 
} from '@fortawesome/free-solid-svg-icons';
import StatsCard from '../components/StatsCard';
import { api } from '../utils/api';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    currentOccupancy: 0,
    occupancyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
        
        // Format recent activity from bookings
        const formattedActivity = response.data.recentActivity?.map(booking => ({
          id: booking._id,
          type: 'booking',
          message: `New booking: ${booking.room?.title || 'Room'} by ${booking.user?.firstName || 'User'} ${booking.user?.lastName || ''}`,
          timestamp: new Date(booking.createdAt),
          icon: faCalendar
        })) || [];
        
        setRecentActivity(formattedActivity);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      setError(error.message);
      
      // Fallback to show some default state
      setStats({
        totalUsers: 0,
        totalRooms: 0,
        totalBookings: 0,
        totalRevenue: 0,
        currentOccupancy: 0,
        occupancyRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: loading ? '...' : stats.totalUsers.toLocaleString(),
      icon: faUsers,
      color: 'bg-cyan-500'
    },
    {
      title: 'Total Rooms',
      value: loading ? '...' : stats.totalRooms.toLocaleString(),
      icon: faBuilding,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Bookings',
      value: loading ? '...' : stats.totalBookings.toLocaleString(),
      icon: faCalendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Revenue',
      value: loading ? '...' : formatCurrency(stats.totalRevenue),
      icon: faDollarSign,
      color: 'bg-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard data
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={fetchDashboardData}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={activity.icon} className="w-4 h-4 text-cyan-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                <FontAwesomeIcon icon={faUsers} className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </button>
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <FontAwesomeIcon icon={faBuilding} className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Rooms</span>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <FontAwesomeIcon icon={faCalendar} className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">View Bookings</span>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <FontAwesomeIcon icon={faArrowTrendUp} className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Server Status</h3>
              <p className="text-xs text-green-600">Operational</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Database</h3>
              <p className="text-xs text-green-600">Connected</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
              </div>
              <h3 className="text-sm font-medium text-gray-900">API Response</h3>
              <p className="text-xs text-yellow-600">245ms avg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;