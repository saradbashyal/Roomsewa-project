import React from 'react';
import { User, TicketCheck, Settings, Mail } from 'lucide-react';

const ActivityFeed = () => {
  const activities = [
    { action: 'New user registered', time: '2 minutes ago', icon: User },
    { action: 'Room #1234 Booked', time: '1 hour ago', icon: TicketCheck },
    { action: 'System backup completed', time: '3 hours ago', icon: Settings },
    { action: 'New message received', time: '5 hours ago', icon: Mail },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center p-3 rounded-lg hover:bg-cyan-50">
            <div className="bg-cyan-100 rounded-full p-2 mr-3">
              <activity.icon className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;