import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faSearch, 
  faFilter, 
  faEye, 
  faCheckCircle, 
  faTimesCircle 
} from '@fortawesome/free-solid-svg-icons';
import { api } from '../utils/api';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getAllBookings(currentPage, 10);
      
      if (response.success) {
        setBookings(response.data.bookings || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Update booking status locally (backend endpoint can be implemented later)
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    } catch (error) {
      // Error handled by UI feedback
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room?.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading bookings...</div>
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
                Error loading bookings
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button 
                  onClick={fetchBookings}
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
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <button 
          onClick={fetchBookings}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendar} className="h-8 w-8 text-cyan-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCheckCircle} className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status?.toLowerCase() === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faTimesCircle} className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length}
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
                placeholder="Search bookings..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Viewing Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{booking._id.slice(-8)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.room?.title}</div>
                  <div className="text-sm text-gray-500">
                    {booking.room?.location?.city && booking.room?.location?.address 
                      ? `${booking.room.location.city}, ${booking.room.location.address}`
                      : booking.room?.location || 'N/A'
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(booking.viewingDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    NPR {booking.totalPrice?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{booking.paymentMethod}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-cyan-600 hover:text-cyan-900">
                      <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                    </button>
                    {booking.status?.toLowerCase() === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="text-green-600 hover:text-green-900"
                          title="Confirm"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredBookings.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings found.</p>
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

export default BookingsPage;
