import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faHeart,
  faBed,
  faHouse,
  faBuilding,
  faSchool,
  faHome,
  faLayerGroup,
  faCouch,
  faUser,
  faBars,
  faFilter,
  faMapMarkerAlt,
  faEye,
  faShare,
  faStar,
  faWifi,
  faCar,
  faCoffee,
  faShield,
  faBolt,
  faTimes,
  faSliders,
  faRupeeSign,
  faCalendarAlt,
  faChevronDown,
  faSignOutAlt,
  faList,
  faBookmark,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecommendationsSection from '../components/RecommendationsSection';
import logo from '../assets/logo.png';

const SearchPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All Rooms');
  const [favorites, setFavorites] = useState(new Set());
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: { min: '', max: '' },
    availableFrom: '',
    amenities: [],
    featured: false,
    verified: false,
    rating: ''
  });

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
  }, []);

  // Read URL parameters and apply filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Apply URL parameters to state
    const location = urlParams.get('location');
    const budget = urlParams.get('budget');
    const roomtype = urlParams.get('roomtype');
    
    if (location) {
      setSearchQuery(location);
    }
    
    if (budget) {
      // Parse budget range and apply to advanced filters
      const budgetRanges = {
        '0-5000': { min: '0', max: '5000' },
        '5000-10000': { min: '5000', max: '10000' },
        '10000-20000': { min: '10000', max: '20000' },
        '20000+': { min: '20000', max: '' }
      };
      
      if (budgetRanges[budget]) {
        setAdvancedFilters(prev => ({
          ...prev,
          priceRange: budgetRanges[budget]
        }));
      }
    }
    
    if (roomtype) {
      // Map roomtype to category
      const roomTypeToCategory = {
        'single': 'Single Room',
        'shared': 'Shared Room',
        '1bhk': '1 BHK',
        '2bhk': '2 BHK',
        '3bhk': '3 BHK',
        'hostel': 'Hostel Room'
      };
      
      if (roomTypeToCategory[roomtype]) {
        setSelectedCategory(roomTypeToCategory[roomtype]);
      }
    }
  }, []);

  const handleListYourRoom = (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to list your room');
      return;
    }

    if (user.role === 'tenant') {
      toast.error('Only landlords can list rooms. Please contact admin to change your role.');
      return;
    }

    if (user.role === 'landlord' || user.role === 'admin') {
      navigate('/add-property');
    } else {
      toast.error('Access denied. Invalid user role.');
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    ['user', 'token', 'userId', 'userName', 'userEmail'].forEach(key => 
      localStorage.removeItem(key)
    );
    
    setUser(null);
    setShowUserDropdown(false);
    toast.success('Logged out successfully');
    window.dispatchEvent(new Event('storage'));
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

  const handleMyBookings = () => {
    handleUserNavigation('/my-bookings');
  };

  const categories = [
    { id: 'all', label: 'All Rooms', icon: faLayerGroup, color: 'from-purple-500 to-pink-500' },
    { id: 'single', label: 'Single Room', icon: faBed, color: 'from-blue-500 to-cyan-500' },
    { id: 'shared', label: 'Shared Room', icon: faCouch, color: 'from-green-500 to-emerald-500' },
    { id: '1bhk', label: '1 BHK', icon: faHome, color: 'from-orange-500 to-red-500' },
    { id: '2bhk', label: '2 BHK', icon: faBuilding, color: 'from-red-500 to-pink-500' },
    { id: '3bhk', label: '3 BHK', icon: faHouse, color: 'from-indigo-500 to-purple-500' },
    { id: 'hostel', label: 'Hostel Room', icon: faSchool, color: 'from-yellow-500 to-orange-500' },
  ];

  const amenityIcons = {
    'wifi': faWifi,
    'air_conditioning': faBolt,
    'parking': faCar,
    'kitchen': faCoffee,
    'bathroom': faShield,
    'balcony': faEye,
    'heating': faBolt,
    'tv': faEye,
    'laundry': faCoffee,
    'furnished': faCouch
  };

  // Available amenities from backend
  const availableAmenities = [
    'wifi', 'parking', 'kitchen', 'bathroom', 'balcony',
    'air_conditioning', 'heating', 'tv', 'laundry', 'furnished'
  ];

  const handleAdvancedFilterChange = (field, value) => {
    if (field === 'amenities') {
      setAdvancedFilters(prev => ({
        ...prev,
        amenities: prev.amenities.includes(value)
          ? prev.amenities.filter(a => a !== value)
          : [...prev.amenities, value]
      }));
    } else if (field === 'priceRange') {
      setAdvancedFilters(prev => ({
        ...prev,
        priceRange: { ...prev.priceRange, ...value }
      }));
    } else {
      setAdvancedFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      priceRange: { min: '', max: '' },
      availableFrom: '',
      amenities: [],
      featured: false,
      verified: false,
      rating: ''
    });
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://roomsewa-project-production.up.railway.app/api/rooms/');
        if (!res.ok) throw new Error('Failed to fetch rooms');
        const response = await res.json();
        
        // Extract rooms from API response
        const roomsData = response.data?.rooms || response.data || response.rooms || [];
        // Filter to show only approved rooms
        const approvedRooms = Array.isArray(roomsData) 
          ? roomsData.filter(room => room.status === 'approved' || room.status === 'available')
          : [];
        setRooms(approvedRooms);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const toggleFavorite = (propertyId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  const PropertyCard = ({ property }) => {
    // More robust image URL extraction
    const getImageUrl = (property) => {
      // Try different possible image field structures
      if (property.posterImage?.url) return property.posterImage.url;
      if (property.posterImage) return property.posterImage;
      if (property.images && property.images.length > 0) {
        if (typeof property.images[0] === 'string') return property.images[0];
        if (property.images[0]?.url) return property.images[0].url;
      }
      if (property.image) return property.image;
      if (property.imageUrl) return property.imageUrl;
      
      // Fallback to placeholder
      return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&crop=center';
    };

    const imageUrl = getImageUrl(property);

    return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 cursor-pointer flex flex-col h-full">
      <div className="relative overflow-hidden">
        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          <img 
            src={imageUrl} 
            alt={property.title} 
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.src = logo; // Fallback to logo if image fails
            }}
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Action buttons overlay */}
        <div className="absolute top-4 right-4 flex flex-col space-y-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property._id || property.id);
            }}
            className="p-2.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <FontAwesomeIcon 
              icon={favorites.has(property._id || property.id) ? faHeart : faHeartRegular}
              className={`text-lg ${
                favorites.has(property._id || property.id)
                  ? 'text-red-500'
                  : 'text-gray-600'
              } transition-colors duration-200`}
            />
          </button>
          <button className="p-2.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <FontAwesomeIcon icon={faShare} className="text-lg text-gray-600" />
          </button>
        </div>

        {/* Verification badge */}
        {property.verified && (
          <div className="absolute top-4 left-4">
            <div className="flex items-center bg-green-500 text-white rounded-full px-3 py-1.5 shadow-lg">
              <FontAwesomeIcon icon={faShield} className="text-xs mr-1" />
              <span className="text-xs font-semibold">Verified</span>
            </div>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-normal">NPR</span>
              <span className="text-xl font-bold">
                {property.price ? property.price.toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-lg">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm mr-1" />
            <span className="text-sm font-semibold text-gray-900">{property.rating || '4.5'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border border-cyan-200">
            <FontAwesomeIcon icon={faBed} className="text-xs mr-1.5" />
            {property.roomType || property.type || property.category || 'Room'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors duration-200 min-h-[3.5rem]">
          {property.title || 'No title'}
        </h3>

        <div className="flex items-center text-gray-600 mb-4 min-h-[1.5rem]">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-cyan-500 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">
            {property.location?.city && property.location?.address 
              ? `${property.location.address}, ${property.location.city}` 
              : property.location?.city || property.location?.address || property.location || 'Location not specified'}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6 min-h-[2.5rem]">
          {(property.amenities?.slice(0, 3) || ['Wifi', 'Furnished']).map((amenity, index) => (
            <div key={index} className="flex items-center bg-gray-50 rounded-lg px-2.5 py-1.5">
              <FontAwesomeIcon icon={amenityIcons[amenity] || faCoffee} className="text-gray-500 text-xs mr-1.5" />
              <span className="text-xs text-gray-600 font-medium">{amenity}</span>
            </div>
          ))}
          {property.amenities?.length > 3 && (
            <div className="flex items-center bg-cyan-50 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-cyan-600 font-semibold">+{property.amenities.length - 3} more</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 mt-auto">
          <Link 
            to={`/room/${property._id || property.id}`}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-center"
          >
            View Details
          </Link>
          <button className="px-4 py-2.5 border-2 border-cyan-200 text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300">
            <FontAwesomeIcon icon={faEye} className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

  const filteredRooms = rooms.filter(room => {
    // Map category labels to roomType values
    const categoryToRoomType = {
      'All Rooms': null,
      'Single Room': 'single',
      'Shared Room': 'shared',
      '1 BHK': '1bhk',
      '2 BHK': '2bhk', 
      '3 BHK': '3bhk',
      'Hostel Room': 'hostel'
    };
    
    const targetRoomType = categoryToRoomType[selectedCategory];
    const matchesCategory = selectedCategory === 'All Rooms' || 
      (room.roomType && room.roomType.toLowerCase() === targetRoomType);
    
    const matchesSearch = !searchQuery || 
      (room.title && room.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.location?.city && room.location.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.location?.address && room.location.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room.roomType && room.roomType.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Advanced filters
    const matchesPriceRange = (!advancedFilters.priceRange.min || room.price >= parseInt(advancedFilters.priceRange.min)) &&
                              (!advancedFilters.priceRange.max || room.price <= parseInt(advancedFilters.priceRange.max));
    
    const matchesAvailableFrom = !advancedFilters.availableFrom || 
                                 (room.availableFrom && new Date(room.availableFrom) <= new Date(advancedFilters.availableFrom));
    
    const matchesAmenities = advancedFilters.amenities.length === 0 ||
                             advancedFilters.amenities.every(amenity => room.amenities?.includes(amenity));
    
    const matchesFeatured = !advancedFilters.featured || room.featured === true;
    
    const matchesRating = !advancedFilters.rating || 
                          (room.statistics?.averageRating && room.statistics.averageRating >= parseFloat(advancedFilters.rating));
    
    return matchesCategory && matchesSearch && matchesPriceRange && matchesAvailableFrom && 
           matchesAmenities && matchesFeatured && matchesRating;
  });

  return (
    <div className="min-h-screen bg-cyan-50">
      {/* Header */}
      <header className="bg-cyan-50/80 backdrop-blur-lg border-b border-cyan-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faHome} className="text-white text-xl" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                  RoomSewa
                </h1>
                <p className="text-xs text-gray-500">Find Your Perfect Room</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search rooms by location, area, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border border-cyan-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm text-gray-700 bg-cyan-50/90 backdrop-blur-sm hover:shadow-md transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleListYourRoom}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <FontAwesomeIcon icon={faHome} className="text-sm" />
                <span>List Your Room</span>
              </button>
              
              <button className="p-3 hover:bg-cyan-100 rounded-xl transition-colors duration-200">
                <FontAwesomeIcon icon={faBars} className="text-gray-600" />
              </button>
              
              {user ? (
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
              ) : (
                <Link 
                  to="/login"
                  className="flex items-center space-x-2 bg-cyan-50/90 backdrop-blur-sm border border-cyan-200 rounded-xl px-4 py-2 hover:bg-cyan-100 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faUser} className="text-cyan-600" />
                  <span className="text-sm font-medium text-gray-700">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter Bar */}
      <div className="bg-cyan-50/60 backdrop-blur-sm border-b border-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center space-x-4 flex-wrap">
              {categories.map((category) => {
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.label)}
                    className={`group flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl transition-all duration-300 whitespace-nowrap min-w-fit mb-2 hover:scale-105 ${
                      selectedCategory === category.label
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg scale-105'
                        : 'bg-cyan-50/80 text-gray-600 hover:bg-cyan-100 hover:text-cyan-600 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      selectedCategory === category.label
                        ? 'bg-white/20'
                        : `bg-gradient-to-r ${category.color} text-white group-hover:scale-110 transition-transform duration-200`
                    }`}>
                      <FontAwesomeIcon icon={category.icon} className="text-lg" />
                    </div>
                    <span className="text-sm font-semibold">{category.label}</span>
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowAdvancedFilters(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-cyan-50 border border-cyan-200 rounded-2xl hover:bg-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-md"
            >
              <FontAwesomeIcon icon={faFilter} className="text-cyan-600" />
              <span className="text-sm font-semibold text-gray-700">Advanced Filters</span>
              {(advancedFilters.priceRange.min || advancedFilters.priceRange.max || 
                advancedFilters.availableFrom || advancedFilters.amenities.length > 0 || 
                advancedFilters.featured || advancedFilters.rating) && (
                <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-1">
                  {[
                    advancedFilters.priceRange.min || advancedFilters.priceRange.max ? 1 : 0,
                    advancedFilters.availableFrom ? 1 : 0,
                    advancedFilters.amenities.length,
                    advancedFilters.featured ? 1 : 0,
                    advancedFilters.rating ? 1 : 0
                  ].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory === 'All Rooms' ? 'Discover Your Perfect Room' : selectedCategory}
            </h1>
            <p className="text-gray-600 text-lg">
              <span className="font-semibold text-cyan-600">{filteredRooms.length}</span> premium rooms available
              {searchQuery && (
                <span>
                  {' '}matching <span className="font-semibold text-cyan-600">"{searchQuery}"</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-500 text-lg font-medium">Finding perfect rooms for you...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faSearch} className="text-red-500 text-3xl" />
            </div>
            <p className="text-red-500 text-xl font-semibold">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full text-center py-32">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No rooms found</h3>
                <p className="text-gray-500 text-lg mb-8">Try adjusting your search criteria or browse different room types.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All Rooms');
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  Browse All Rooms
                </button>
              </div>
            ) : (
              filteredRooms.map((property) => (
                <PropertyCard key={property._id || property.id} property={property} />
              ))
            )}
          </div>
        )}
      </main>

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Advanced Filters</h2>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faRupeeSign} className="text-cyan-600 mr-2" />
                  Price Range (NPR)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Price</label>
                    <input
                      type="number"
                      value={advancedFilters.priceRange.min}
                      onChange={(e) => handleAdvancedFilterChange('priceRange', { min: e.target.value })}
                      placeholder="Min price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price</label>
                    <input
                      type="number"
                      value={advancedFilters.priceRange.max}
                      onChange={(e) => handleAdvancedFilterChange('priceRange', { max: e.target.value })}
                      placeholder="Max price"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Available From */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-cyan-600 mr-2" />
                  Available From
                </h3>
                <input
                  type="date"
                  value={advancedFilters.availableFrom}
                  onChange={(e) => handleAdvancedFilterChange('availableFrom', e.target.value)}
                  className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faSliders} className="text-cyan-600 mr-2" />
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {availableAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      className={`flex items-center space-x-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        advancedFilters.amenities.includes(amenity)
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={advancedFilters.amenities.includes(amenity)}
                        onChange={() => handleAdvancedFilterChange('amenities', amenity)}
                        className="hidden"
                      />
                      <FontAwesomeIcon 
                        icon={amenityIcons[amenity] || faCoffee} 
                        className={`${
                          advancedFilters.amenities.includes(amenity) ? 'text-cyan-600' : 'text-gray-500'
                        }`} 
                      />
                      <span className="text-sm font-medium capitalize">
                        {amenity.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faStar} className="text-cyan-600 mr-2" />
                  Minimum Rating
                </h3>
                <select
                  value={advancedFilters.rating}
                  onChange={(e) => handleAdvancedFilterChange('rating', e.target.value)}
                  className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Featured Only */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faShield} className="text-cyan-600 mr-2" />
                  Special Properties
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advancedFilters.featured}
                      onChange={(e) => handleAdvancedFilterChange('featured', e.target.checked)}
                      className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured Properties Only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={clearAdvancedFilters}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-200"
                  >
                    Apply Filters ({filteredRooms.length} rooms)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <RecommendationsSection />

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

export default SearchPage;
