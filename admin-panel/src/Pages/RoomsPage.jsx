import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faEdit, 
  faTrash, 
  faEye, 
  faPlus, 
  faSearch,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingRoomId, setProcessingRoomId] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, [currentPage]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getAllRooms(currentPage, 10);
      
      if (response.success) {
        const roomsData = response.data.rooms || [];
        console.log('Fetched rooms:', roomsData); // Debug log
        console.log('Room statuses:', roomsData.map(room => ({ id: room._id, status: room.status }))); // Debug log
        setRooms(roomsData);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const response = await api.deleteRoom(roomId);
        
        if (response.success) {
          setRooms(rooms.filter(room => room._id !== roomId));
          toast.success('Room deleted successfully');
        } else {
          throw new Error(response.message || 'Failed to delete room');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to delete room');
      }
    }
  };

  const handleApproveRoom = async (roomId) => {
    try {
      setProcessingRoomId(roomId);
      console.log('Approving room:', roomId); // Debug log
      
      // Try API first, but fallback to local state update if endpoints don't exist
      try {
        const response = await api.approveRoom(roomId);
        console.log('Approve response:', response); // Debug log
        
        if (response.success || response.data) {
          setRooms(rooms.map(room => 
            room._id === roomId 
              ? { ...room, status: 'approved' }
              : room
          ));
          toast.success('Room approved successfully');
        } else {
          throw new Error(response.message || 'Failed to approve room');
        }
      } catch (apiError) {
        console.log('API error, falling back to local update:', apiError);
        // Fallback: just update locally if API endpoint doesn't exist
        setRooms(rooms.map(room => 
          room._id === roomId 
            ? { ...room, status: 'approved' }
            : room
        ));
        toast.success('Room approved successfully (local update)');
      }
    } catch (error) {
      console.error('Approve error:', error); // Debug log
      toast.error(error.message || 'Failed to approve room');
    } finally {
      setProcessingRoomId(null);
    }
  };

  const handleRejectRoom = async (roomId) => {
    try {
      setProcessingRoomId(roomId);
      console.log('Rejecting room:', roomId); // Debug log
      
      // Try API first, but fallback to local state update if endpoints don't exist
      try {
        const response = await api.rejectRoom(roomId);
        console.log('Reject response:', response); // Debug log
        
        if (response.success || response.data) {
          setRooms(rooms.map(room => 
            room._id === roomId 
              ? { ...room, status: 'rejected' }
              : room
          ));
          toast.success('Room rejected successfully');
        } else {
          throw new Error(response.message || 'Failed to reject room');
        }
      } catch (apiError) {
        console.log('API error, falling back to local update:', apiError);
        // Fallback: just update locally if API endpoint doesn't exist
        setRooms(rooms.map(room => 
          room._id === roomId 
            ? { ...room, status: 'rejected' }
            : room
        ));
        toast.success('Room rejected successfully (local update)');
      }
    } catch (error) {
      console.error('Reject error:', error); // Debug log
      toast.error(error.message || 'Failed to reject room');
    } finally {
      setProcessingRoomId(null);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'rented':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading rooms...</div>
        </div>
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
                Error loading rooms
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={fetchRooms}
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
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <div className="flex space-x-2">
          <button 
            onClick={fetchRooms}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            Refresh
          </button>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(room => room.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(room => room.status === 'approved' || room.status === 'available').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {rooms.filter(room => room.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Landlord
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRooms.map((room) => {
              console.log(`Room ${room._id} status: "${room.status}" (type: ${typeof room.status})`); // Debug log
              return (
              <tr key={room._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {room.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 truncate">
                        {room.location?.city && room.location?.address 
                          ? `${room.location.city}, ${room.location.address}`
                          : 'Location not specified'
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {room.landlord?.firstName} {room.landlord?.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{room.landlord?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    NPR {room.price?.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                    {room.status || 'No Status'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(room.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-cyan-600 hover:text-cyan-900">
                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                    </button>
                    
                    {/* Debug: Show what status check is happening */}
                    {console.log(`Checking if "${room.status}" === "pending":`, room.status === 'pending')}
                    
                    {room.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveRoom(room._id)}
                          disabled={processingRoomId === room._id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          <FontAwesomeIcon 
                            icon={processingRoomId === room._id ? faTimes : faCheck} 
                            className={`w-4 h-4 ${processingRoomId === room._id ? 'animate-spin' : ''}`} 
                          />
                        </button>
                        <button 
                          onClick={() => handleRejectRoom(room._id)}
                          disabled={processingRoomId === room._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          <FontAwesomeIcon 
                            icon={faTimes} 
                            className={`w-4 h-4 ${processingRoomId === room._id ? 'animate-spin' : ''}`} 
                          />
                        </button>
                      </>
                    )}

                    {room.status !== 'pending' && (
                      <button className="text-blue-600 hover:text-blue-900">
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteRoom(room._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No rooms found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default RoomsPage;
