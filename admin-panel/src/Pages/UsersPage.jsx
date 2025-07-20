import React from 'react';
import { Mail, Phone } from 'lucide-react';

const UsersPage = () => {
  const users = [
    { id: 1, name: 'Sarad Bashyal', email: 'saradbashyal@gmail.com', status: 'active', avatar: '👤' },
    { id: 2, name: 'Bijay chaudhary', email: 'Bijaychaudhary@gmail.com', status: 'inactive', avatar: '👤' },
    { id: 3, name: 'Sudha Acharya', email: 'sudhaAcharya@gmail.com', status: 'active', avatar: '👤' },
    { id: 4, name: 'Sudip Aryal', email: 'sudiparyal@gmail.com', status: 'active', avatar: '👤' },
    { id: 5, name: 'kim jong-un', email: 'kim jong-un@gmail.com', status: 'active', avatar: '👤' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors">
          Add User
        </button>
      </div>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-cyan-50">
            <div className="flex items-center">
              <span className="text-3xl mr-4">{user.avatar}</span>
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
              <button className="text-cyan-600 hover:text-cyan-800">
                <Mail className="w-4 h-4" />
              </button>
              <button className="text-green-600 hover:text-green-800">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;