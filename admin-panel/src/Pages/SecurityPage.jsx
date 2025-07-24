import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShield, 
  faExclamationTriangle, 
  faEye, 
  faBan, 
  faCheckCircle, 
  faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';

const SecurityPage = () => {
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSuspendUser = (email) => {
    showMessage(`User ${email} has been suspended`);
  };

  const handleDismissReport = (reportId) => {
    showMessage(`Report #${reportId} has been dismissed`);
  };

  const handleTakeAction = (reportId) => {
    showMessage(`Action taken on Report #${reportId}`);
  };

  const handleInvestigate = (user) => {
    showMessage(`Investigating user: ${user}`);
  };

  // Simple dummy data
  const suspiciousActivities = [
    {
      id: 1,
      type: 'Multiple Failed Logins',
      user: 'john.doe@example.com',
      details: '5 failed login attempts in 10 minutes',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'Unusual Payment Activity',
      user: 'jane.smith@example.com', 
      details: 'Multiple payment attempts with different cards',
      severity: 'high'
    }
  ];

  const reportedUsers = [
    {
      id: 1,
      reportedUser: 'suspicious.user@example.com',
      reportedBy: 'victim@example.com',
      reason: 'Fraudulent listing',
      status: 'pending'
    },
    {
      id: 2,
      reportedUser: 'spam.account@example.com',
      reportedBy: 'honest.user@example.com',
      reason: 'Spam messages',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Security Management</h1>
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faShield} className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Security Score</p>
              <p className="text-2xl font-bold text-gray-900">85%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faBan} className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faEye} className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Logs</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Suspicious Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {suspiciousActivities.map((activity) => (
              <div key={activity.id} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-orange-500" />
                      <h3 className="font-medium">{activity.type}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{activity.details}</p>
                    <p className="text-xs text-gray-600">User: {activity.user}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleInvestigate(activity.user)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Investigate
                    </button>
                    <button 
                      onClick={() => handleSuspendUser(activity.user)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Suspend User
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reported Users */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Reports</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reportedUsers.map((report) => (
              <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon icon={faBan} className="w-5 h-5 text-red-500" />
                      <span className="font-medium">Report against: {report.reportedUser}</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Reason:</strong> {report.reason}
                    </p>
                    <p className="text-xs text-gray-500">Reported by: {report.reportedBy}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleTakeAction(report.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                      <span>Take Action</span>
                    </button>
                    <button 
                      onClick={() => handleDismissReport(report.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;