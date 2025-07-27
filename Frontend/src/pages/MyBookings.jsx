import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faArrowLeft,
  faCalendarAlt,
  faMapMarkerAlt,
  faRupeeSign,
  faBed,
  faUser,
  faPhone,
  faEnvelope,
  faCheck,
  faTimes,
  faHourglass,
  faSearch,
  faFilter,
  faEye,
  faChevronDown,
  faSignOutAlt,
  faList,
  faBookmark,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faSync
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Get user data from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    
    // Check if user is authenticated
    if (!userData) {
      toast.error('Please login to view your bookings.');
      navigate('/login');
      return;
    }

    const handleStorageChange = () => {
      const userData = getUserData();
      setUser(userData);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  // Fetch bookings function (can be called for initial load or refresh)
  const fetchBookings = async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('=== FETCH BOOKINGS DEBUG ===');
      console.log('User data:', user);
      console.log('User ID:', user._id || user.id);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Is refresh:', isRefresh);
      
      const url = `https://roomsewa-project-production.up.railway.app/api/bookings/user/${user._id || user.id}`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`Failed to fetch bookings: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      setBookings(data.data?.bookings || data.bookings || data || []);
      setLastRefresh(new Date());
      
      if (isRefresh) {
        toast.success('Bookings refreshed successfully!');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
      toast.error(`Failed to load bookings: ${err.message}`);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    fetchBookings(true);
  };

  // Fetch user's bookings
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Auto-refresh every 30 seconds to check for booking status updates
  useEffect(() => {
    if (!user) return;

    const autoRefreshInterval = setInterval(() => {
      fetchBookings(true);
    }, 30000); // 30 seconds

    return () => clearInterval(autoRefreshInterval);
  }, [user]);

  const handleLogout = () => {
    ['user', 'token', 'userId', 'userName', 'userEmail'].forEach(key => 
      localStorage.removeItem(key)
    );
    
    setUser(null);
    setShowUserDropdown(false);
    toast.success('Logged out successfully');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const handleUserNavigation = (path) => {
    setShowUserDropdown(false);
    navigate(path);
  };

  const handleMyListings = () => {
    if (user?.role === 'landlord' || user?.role === 'admin') {
      handleUserNavigation('/my-listings');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://roomsewa-project-production.up.railway.app/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'User requested cancellation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      toast.success('Booking cancelled successfully');
      // Refresh bookings
      window.location.reload();
    } catch (error) {
      toast.error(`Failed to cancel booking: ${error.message}`);
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'confirmed':
        return faCheckCircle;
      case 'pending':
        return faClock;
      case 'cancelled':
        return faTimesCircle;
      case 'completed':
        return faCheck;
      default:
        return faExclamationTriangle;
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImageUrl = (room) => {
    if (room?.posterImage?.url) return room.posterImage.url;
    if (room?.posterImage) return room.posterImage;
    if (room?.images && room.images.length > 0) {
      if (typeof room.images[0] === 'string') return room.images[0];
      if (room.images[0]?.url) return room.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchQuery || 
      (booking.room?.title && booking.room.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.room?.location?.city && booking.room.location.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (booking.room?.location?.address && booking.room.location.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Fix status filtering by comparing lowercase values
    const matchesStatus = statusFilter === 'all' || 
      (booking.status && booking.status.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const BookingCard = ({ booking }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src={getImageUrl(booking.room)} 
            alt={booking.room?.title || 'Room'} 
            className="h-48 md:h-full w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center';
            }}
          />
        </div>
        
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {booking.room?.title || 'Room Booking'}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-cyan-500 mr-2" />
                <span className="text-sm">
                  {booking.room?.location?.city && booking.room?.location?.address 
                    ? `${booking.room.location.address}, ${booking.room.location.city}` 
                    : booking.room?.location?.city || booking.room?.location?.address || 'Location not specified'}
                </span>
              </div>
            </div>
            
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
              <FontAwesomeIcon icon={getStatusIcon(booking.status)} className="mr-1" />
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-cyan-500 mr-2" />
              <div>
                <span className="text-xs text-gray-500">Viewing Date</span>
                <p className="text-sm font-medium">
                  {booking.viewingDate ? new Date(booking.viewingDate).toLocaleDateString() : 
                   booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faBed} className="text-cyan-500 mr-2" />
              <div>
                <span className="text-xs text-gray-500">Room Type</span>
                <p className="text-sm font-medium">
                  {booking.room?.roomType || 'Standard Room'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faRupeeSign} className="text-cyan-500 mr-2" />
              <div>
                <span className="text-xs text-gray-500">Total Amount</span>
                <p className="text-sm font-bold text-gray-900">
                  NPR {booking.totalAmount?.toLocaleString() || booking.room?.price?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-cyan-500 mr-2" />
              <div>
                <span className="text-xs text-gray-500">Booking Date</span>
                <p className="text-sm font-medium">
                  {new Date(booking.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Landlord Info */}
          {booking.room?.landlord && (
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Landlord Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faUser} className="text-cyan-500 mr-2" />
                  <span className="text-sm">
                    {booking.room.landlord.name || booking.room.landlord.username || 'Landlord'}
                  </span>
                </div>
                {booking.room.landlord.email && (
                  <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon icon={faEnvelope} className="text-cyan-500 mr-2" />
                    <span className="text-sm">{booking.room.landlord.email}</span>
                  </div>
                )}
                {booking.room.landlord.phone && (
                  <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon icon={faPhone} className="text-cyan-500 mr-2" />
                    <span className="text-sm">{booking.room.landlord.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Booked: {new Date(booking.createdAt || Date.now()).toLocaleDateString()}</span>
            <div className="flex space-x-2">
              <Link 
                to={`/room/${booking.room?._id}`}
                className="bg-cyan-50 text-cyan-600 hover:bg-cyan-100 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-xs"
              >
                <FontAwesomeIcon icon={faEye} className="mr-1" />
                View Room
              </Link>
              
              {/* Show cancel button for bookings that can be cancelled */}
              {(booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'confirmed') && (
                <button
                  onClick={() => handleCancelBooking(booking._id)}
                  className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-xs"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50">
      {/* Header */}
      <header className="bg-cyan-50/80 backdrop-blur-lg border-b border-cyan-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link 
                to="/search" 
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </Link>
              
              <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faHome} className="text-white text-xl" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                    RoomSewa
                  </h1>
                  <p className="text-xs text-gray-500">My Bookings</p>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 flex items-center space-x-4">
              <div className="relative flex-1">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search your bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 border border-cyan-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm text-gray-700 bg-cyan-50/90 backdrop-blur-sm"
                />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh bookings"
              >
                <FontAwesomeIcon 
                  icon={faSync} 
                  className={`text-lg ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            {/* User Dropdown */}
            {user && (
              <div className="relative user-dropdown-container">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 bg-cyan-50/90 backdrop-blur-sm border border-cyan-200 rounded-xl px-4 py-2 hover:bg-cyan-100 transition-all duration-200"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-gray-900">
                      {user.name || user.username || 'User'}
                    </span>
                    <span className="text-xs text-cyan-600 capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    </div>
                    <FontAwesomeIcon 
                      icon={faChevronDown} 
                      className={`text-gray-500 text-xs transition-transform duration-200 ${
                        showUserDropdown ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || user.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email || 'No email provided'}
                      </p>
                      <p className="text-xs text-cyan-600 capitalize font-medium">
                        {user.role} Account
                      </p>
                    </div>
                    
                    <div className="py-2">
                      {(user.role === 'landlord' || user.role === 'admin') && (
                        <button
                          onClick={handleMyListings}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faList} className="text-cyan-600" />
                          <span className="text-sm text-gray-700">My Listings</span>
                        </button>
                      )}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} className="text-red-500" />
                          <span className="text-sm text-red-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-cyan-50/60 backdrop-blur-sm border-b border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <div className="flex space-x-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === status
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                    }`}
                  >
                    {status === 'all' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-cyan-600">{filteredBookings.length}</span> of {bookings.length} bookings
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
              <p className="text-gray-600">Track your room reservations and manage your stays</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <p className="text-sm text-gray-500">
                  Auto-refreshes every 30 seconds
                </p>
                {refreshing && (
                  <FontAwesomeIcon 
                    icon={faSync} 
                    className="text-cyan-500 animate-spin text-sm"
                  />
                )}
              </div>
              <p className="text-xs text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-500 text-lg font-medium">Loading your bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faTimes} className="text-red-500 text-3xl" />
            </div>
            <p className="text-red-500 text-xl font-semibold mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faBookmark} className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filters'}
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              {bookings.length === 0 
                ? 'Start exploring rooms and make your first booking.' 
                : 'Try adjusting your search criteria or filters.'}
            </p>
            {bookings.length === 0 && (
              <Link 
                to="/search"
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 inline-flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faSearch} />
                <span>Browse Rooms</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default MyBookings;
