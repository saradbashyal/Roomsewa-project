import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faArrowLeft,
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faMapMarkerAlt,
  faRupeeSign,
  faBed,
  faCalendarAlt,
  faUsers,
  faCheck,
  faTimes,
  faSearch,
  faFilter,
  faStar,
  faWifi,
  faCar,
  faCoffee,
  faShield,
  faBolt,
  faUser,
  faChevronDown,
  faSignOutAlt,
  faList,
  faBookmark,
  faBars,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyListings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    
    // Check if user is authorized to view this page
    if (!userData || (userData.role !== 'landlord' && userData.role !== 'admin')) {
      toast.error('Access denied. Only landlords can view listings.');
      navigate('/');
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

  // Fetch landlord's listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`https://roomsewa-project-production.up.railway.app/api/rooms/landlord/${user._id || user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        setListings(data.data?.rooms || data.rooms || data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchListings();
    }
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

  const handleMyBookings = () => {
    handleUserNavigation('/my-bookings');
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://roomsewa-project-production.up.railway.app/api/rooms/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      setListings(listings.filter(listing => listing._id !== listingId));
      toast.success('Listing deleted successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return faClock;
      case 'approved':
        return faCheck;
      case 'rejected':
        return faTimes;
      default:
        return faExclamationTriangle;
    }
  };

  const getStatusMessage = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Your property is under review by our admin team';
      case 'approved':
        return 'Your property has been approved and is live';
      case 'rejected':
        return 'Your property was rejected. Please contact admin for details';
      default:
        return 'Unknown status';
    }
  };

  const getImageUrl = (listing) => {
    if (listing.posterImage?.url) return listing.posterImage.url;
    if (listing.posterImage) return listing.posterImage;
    if (listing.images && listing.images.length > 0) {
      if (typeof listing.images[0] === 'string') return listing.images[0];
      if (listing.images[0]?.url) return listing.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center';
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      (listing.title && listing.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (listing.location?.city && listing.location.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (listing.location?.address && listing.location.address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && listing.status === 'pending') ||
      (statusFilter === 'approved' && listing.status === 'approved') ||
      (statusFilter === 'rejected' && listing.status === 'rejected') ||
      (statusFilter === 'available' && (listing.isAvailable !== false)) ||
      (statusFilter === 'unavailable' && (listing.isAvailable === false));
    
    return matchesSearch && matchesStatus;
  });

  const ListingCard = ({ listing }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative">
        <img 
          src={getImageUrl(listing)} 
          alt={listing.title} 
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center';
          }}
        />
        
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(listing.status)}`}>
            <FontAwesomeIcon 
              icon={getStatusIcon(listing.status)} 
              className="mr-1" 
            />
            {listing.status?.toUpperCase() || 'NO STATUS'}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon icon={faRupeeSign} className="text-xs" />
              <span className="text-lg font-bold">
                {listing.price ? listing.price.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <FontAwesomeIcon icon={faBed} className="mr-1" />
            {listing.roomType || 'Room'}
          </span>
          <div className="flex items-center text-gray-500">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
            <span className="text-sm">{listing.rating || '4.5'}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {listing.title || 'No title'}
        </h3>

        <div className="flex items-center text-gray-600 mb-4">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-cyan-500 mr-2" />
          <span className="text-sm truncate">
            {listing.location?.city && listing.location?.address 
              ? `${listing.location.address}, ${listing.location.city}` 
              : listing.location?.city || listing.location?.address || 'Location not specified'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
            <span>Listed: {new Date(listing.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faEye} className="mr-1" />
            <span>{listing.views || 0} views</span>
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-3 rounded-lg border text-xs mb-4 ${getStatusColor(listing.status)}`}>
          {getStatusMessage(listing.status)}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Link 
            to={`/room/${listing._id}`}
            className="flex-1 bg-cyan-50 text-cyan-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-cyan-100 transition-all duration-200 text-center"
          >
            <FontAwesomeIcon icon={faEye} className="mr-2" />
            View
          </Link>
          <Link 
            to={`/edit-property/${listing._id}`}
            className="flex-1 bg-blue-50 text-blue-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-100 transition-all duration-200 text-center"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit
          </Link>
          <button 
            onClick={() => handleDeleteListing(listing._id)}
            className="flex-1 bg-red-50 text-red-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-red-100 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete
          </button>
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
                  <p className="text-xs text-gray-500">My Room Listings</p>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search your listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 border border-cyan-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm text-gray-700 bg-cyan-50/90 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/add-property"
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
                <span>Add New Property</span>
              </Link>

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
                        <button
                          onClick={handleMyBookings}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faBookmark} className="text-cyan-600" />
                          <span className="text-sm text-gray-700">My Bookings</span>
                        </button>
                        
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
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-cyan-50/60 backdrop-blur-sm border-b border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <div className="flex space-x-2">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      statusFilter === status
                        ? 'bg-cyan-600 text-white shadow-lg'
                        : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                    }`}
                  >
                    {status === 'all' ? 'All Listings' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-cyan-600">{filteredListings.length}</span> of {listings.length} listings
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Room Listings</h1>
          <p className="text-gray-600">Manage your room rentals and track their performance</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-500 text-lg font-medium">Loading your listings...</p>
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
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faHome} className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {listings.length === 0 ? 'No listings yet' : 'No listings match your filters'}
            </h3>
            <p className="text-gray-500 text-lg mb-8">
              {listings.length === 0 
                ? 'Start by adding your first property to attract potential tenants.' 
                : 'Try adjusting your search criteria or filters.'}
            </p>
            {listings.length === 0 && (
              <Link 
                to="/add-property"
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 inline-flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Your First Property</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
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

export default MyListings;
