import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-00">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} rounded-full p-3`}>
          <FontAwesomeIcon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;