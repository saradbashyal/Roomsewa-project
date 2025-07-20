import React from 'react';
import StatsCard from '../components/StatsCard';
import UserTable from '../components/UserTable';
import ActivityFeed from '../components/ActivityFeed';
import { DollarSign, Users, ShoppingCart, Eye, BarChart3 } from 'lucide-react';

const DashboardPage = () => {
  const statsCards = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-cyan-500'
    },
    {
      title: 'Total Users',
      value: '2,350',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Sales',
      value: '12,234',
      change: '+19%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    },
    {
      title: 'Active Now',
      value: '573',
      change: '+201',
      trend: 'up',
      icon: Eye,
      color: 'bg-orange-500'
    }
  ];

  const recentUsers = [
{ id: 1, name: 'Sarad Bashyal', email: 'saradbashyal@gmail.com', status: 'active', avatar: '👤' },
    { id: 2, name: 'Bijay chaudhary', email: 'Bijaychaudhary@gmail.com', status: 'inactive', avatar: '👤' },
    { id: 3, name: 'Sudha Acharya', email: 'sudhaAcharya@gmail.com', status: 'active', avatar: '👤' },
    { id: 4, name: 'Sudip Aryal', email: 'sudiparyal@gmail.com', status: 'active', avatar: '👤' },
    { id: 5, name: 'kim jong-un', email: 'kim jong-un@gmail.com', status: 'active', avatar: '👤' },
  ];

  return (
    <div className="space-y-6">
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-64 bg-cyan-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
              <p className="text-cyan-600">Chart placeholder</p>
            </div>
          </div>
        </div>
 
        <UserTable users={recentUsers} />
      </div>

      <ActivityFeed />
    </div>
  );
};

export default DashboardPage;