import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faUser } from '@fortawesome/free-solid-svg-icons';
import { api } from '../utils/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getAllUsers(currentPage, 10);
      
      if (response.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading users
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={fetchUsers}
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <button 
          onClick={fetchUsers}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-cyan-50">
                <div className="flex items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Role: {user.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'landlord' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.email && (
                    <button className="text-cyan-600 hover:text-cyan-800">
                      <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                    </button>
                  )}
                  {user.phone && (
                    <button className="text-green-600 hover:text-green-800">
                      <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersPage;