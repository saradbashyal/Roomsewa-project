import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faMapMarkerAlt,
  faRupeeSign,
  faBed,
  faWifi,
  faCar,
  faCoffee,
  faEye,
  faSchool,
  faCouch,
  faHome,
  faBuilding,
  faHouse,
  faUser,
  faPhone,
  faEnvelope,
  faStar,
  faHeart,
  faShare,
  faTimes,
  faCalendar,
  faCreditCard,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/logo.png';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    paymentMethod: 'esewa',
    bookingDate: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking fee calculation - 25% of room price
  const SERVICE_CHARGE = 500; // NPR 500 service charge if user doesn't proceed
  const getBookingFee = () => {
    if (!room?.price) return 0;
    const twentyFivePercent = Math.round(room.price * 0.25); // 25% of room price
    // Ensure booking fee is at least equal to service charge
    return Math.max(twentyFivePercent, SERVICE_CHARGE);
  };

  // Get available booking dates (next 3 days only)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };

  // Get minimum and maximum dates for date input
  const getDateConstraints = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 2); // Maximum 3 days from today (0, 1, 2)
    
    return {
      min: today.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };

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

  // Check if current user is the landlord of this room
  const isCurrentUserLandlord = () => {
    const user = getUserData();
    if (!user || !room || !room.landlord) {
      return false;
    }

    // Handle different ID field names and direct ID values
    const currentUserId = user._id || user.id;
    const landlordId = room.landlord._id || room.landlord.id || room.landlord;
    
    // Convert both to strings for comparison
    const isLandlord = String(currentUserId) === String(landlordId);
    
    return isLandlord;
  };

  const amenityIcons = {
    'wifi': faWifi,
    'air_conditioning': faEye,
    'parking': faCar,
    'kitchen': faCoffee,
    'balcony': faEye,
    'furnished': faCouch
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/api/rooms/${id}`);
        if (!response.ok) {
          throw new Error('Room not found');
        }
        const result = await response.json();
        // Handle ApiResponse structure
        const roomData = result.data || result;
        setRoom(roomData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoom();
    }
  }, [id]);

  const getImageUrl = (room) => {
    if (room?.posterImage?.url) return room.posterImage.url;
    if (room?.posterImage) return room.posterImage;
    if (room?.images && room.images.length > 0) {
      if (typeof room.images[0] === 'string') return room.images[0];
      if (room.images[0]?.url) return room.images[0].url;
    }
    if (room?.image) return room.image;
    if (room?.imageUrl) return room.imageUrl;
    
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center';
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleBookNow = () => {
    const user = getUserData();
    if (!user) {
      toast.error('Please login to book a room');
      navigate('/login');
      return;
    }

    // Check if user is the landlord of this room using the same logic
    if (isCurrentUserLandlord()) {
      toast.error('You cannot book your own room. As a landlord, you are not allowed to book your own properties.');
      return;
    }

    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    const user = getUserData();
    if (!user) {
      toast.error('Please login to proceed');
      return;
    }

    if (!bookingData.bookingDate) {
      toast.error('Please select a booking date');
      return;
    }

    setBookingLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Use selected booking date for viewing
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: id,
          viewingDate: bookingData.bookingDate, // Use viewingDate instead of startDate/endDate
          totalPrice: getBookingFee(),
          paymentMethod: 'esewa',
          bookingType: 'viewing'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Booking failed');
      }

      if (result.data?.payment_url) {
        // Redirect to eSewa payment URL
        window.location.href = result.data.payment_url;
      } else {
        toast.error('Payment processing failed. Please try again.');
        setShowBookingModal(false);
      }

    } catch (error) {
      toast.error(error.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 text-lg font-medium">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link 
            to="/search"
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h1>
          <Link 
            to="/search"
            className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Header */}
      <header className="bg-cyan-50/80 backdrop-blur-lg border-b border-cyan-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-cyan-100 rounded-xl transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              </button>
              
              <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faHome} className="text-white text-xl" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                    RoomSewa
                  </h1>
                  <p className="text-xs text-gray-500">Room Details</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleFavorite}
                className="p-3 hover:bg-cyan-100 rounded-xl transition-colors duration-200"
              >
                <FontAwesomeIcon 
                  icon={isFavorite ? faHeart : faHeartRegular}
                  className={`text-xl ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
                />
              </button>
              <button className="p-3 hover:bg-cyan-100 rounded-xl transition-colors duration-200">
                <FontAwesomeIcon icon={faShare} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl">
              <img 
                src={getImageUrl(room)} 
                alt={room.title}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = logo;
                }}
              />
              <div className="absolute top-4 left-4">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-normal">NPR</span>
                    <span className="text-xl font-bold">
                      {room.price ? room.price.toLocaleString() : 'N/A'}
                    </span>
                    <span className="text-sm">/month</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm mr-1" />
                  <span className="text-sm font-semibold text-gray-900">{room.rating || '4.5'}</span>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border border-cyan-200">
                    <FontAwesomeIcon icon={faBed} className="text-sm mr-2" />
                    {room.roomType || 'Room'}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-cyan-500 mr-2" />
                  <span>
                    {room.location?.city && room.location?.address 
                      ? `${room.location.address}, ${room.location.city}` 
                      : room.location?.city || room.location?.address || room.location || 'Location not specified'}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  {room.description || 'No description available'}
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(room.amenities || []).map((amenity, index) => (
                    <div key={index} className="flex items-center bg-gray-50 rounded-lg px-4 py-3">
                      <FontAwesomeIcon 
                        icon={amenityIcons[amenity] || faCoffee} 
                        className="text-cyan-600 text-lg mr-3" 
                      />
                      <span className="text-gray-700 font-medium capitalize">
                        {amenity.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Details */}
              {(room.bedrooms || room.bathrooms || room.area) && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                  {room.bedrooms && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{room.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                  )}
                  {room.bathrooms && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{room.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                  )}
                  {room.area && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{room.area}</div>
                      <div className="text-sm text-gray-600">Sq Ft</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact and Booking */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Landlord</h3>
              
              {room.landlord && (
                <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{room.landlord.name || 'Landlord'}</div>
                    <div className="text-sm text-gray-600">{room.landlord.email || ''}</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {room.contactPhone && (
                  <a 
                    href={`tel:${room.contactPhone}`}
                    className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-300"
                  >
                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                    Call Now
                  </a>
                )}
                
                {room.contactEmail && (
                  <a 
                    href={`mailto:${room.contactEmail}`}
                    className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                    Send Email
                  </a>
                )}

                {isCurrentUserLandlord() ? (
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 text-gray-600 rounded-xl text-center">
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    Your Property - Booking Not Available
                  </div>
                ) : (
                  <button 
                    onClick={handleBookNow}
                    className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 hover:shadow-lg"
                  >
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    Book Viewing
                  </button>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Available From</span>
                  <span className="font-semibold">
                    {room.availableFrom ? new Date(room.availableFrom).toLocaleDateString() : 'Now'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-semibold capitalize">{room.roomType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-semibold text-cyan-600">
                    NPR {room.price ? room.price.toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Room Viewing</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Room Info */}
              <div className="bg-cyan-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{room?.title}</h3>
                <p className="text-sm text-gray-600">
                  Monthly Rent: NPR {room?.price?.toLocaleString()}
                </p>
              </div>

              {/* Viewing Fee Info */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  How it works:
                </h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Pay NPR {getBookingFee().toLocaleString()} ({room?.price && getBookingFee() === Math.round(room.price * 0.25) ? '25% of room price' : `minimum NPR ${SERVICE_CHARGE}`}) to book viewing</li>
                  <li>• <strong>If you accept:</strong> NPR 50 platform fee, NPR {Math.max(0, getBookingFee() - 50).toLocaleString()} to landlord</li>
                  <li>• <strong>If you reject:</strong> NPR {Math.max(0, getBookingFee() - SERVICE_CHARGE).toLocaleString()} refund</li>
                  <li>• NPR {SERVICE_CHARGE} covers viewing service & compensation</li>
                </ul>
              </div>

              {/* Booking Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Viewing Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, bookingDate: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none bg-white text-sm font-medium appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Choose a date...</option>
                    {getAvailableDates().map((date, index) => (
                      <option key={date.value} value={date.value}>
                        {date.label} ({date.value})
                      </option>
                    ))}
                  </select>
                  <FontAwesomeIcon 
                    icon={faCalendar} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-600 pointer-events-none" 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Viewing can only be scheduled within the next 3 days
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <label className="flex items-center p-2 border-2 border-green-500 bg-green-50 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="esewa"
                    checked={true}
                    readOnly
                    className="mr-2"
                  />
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faCreditCard} className="text-green-600 mr-2 text-sm" />
                    <span className="font-medium text-sm">eSewa (Digital Payment)</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Digital payment required to secure viewing
                </p>
              </div>

              {/* Booking Fee */}
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Viewing Fee ({room?.price && getBookingFee() === Math.round(room.price * 0.25) ? '25%' : 'Min'}):</span>
                  <span className="text-lg font-bold text-cyan-600">
                    NPR {getBookingFee().toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>• Accept room:</span>
                    <span className="text-green-600">NPR {Math.max(0, getBookingFee() - 50).toLocaleString()} + NPR 50 fee</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Reject room:</span>
                    <span className="text-orange-600">NPR {Math.max(0, getBookingFee() - SERVICE_CHARGE).toLocaleString()} refund</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Service fee:</span>
                    <span className="text-blue-600">NPR {SERVICE_CHARGE}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingSubmit}
                  disabled={bookingLoading || !bookingData.bookingDate}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheck} className="mr-1 text-xs" />
                      {bookingData.bookingDate 
                        ? `Pay NPR ${getBookingFee().toLocaleString()}`
                        : 'Select Date'
                      }
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default RoomDetails;
