import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faRupeeSign, 
  faBed, 
  faStar,
  faHeart,
  faEye,
  faMagic,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { getRecommendations } from '../services/api';
import { toast } from 'react-toastify';

const RecommendationsSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getRecommendations(9); // Fetch more items for expansion
      setRecommendations(response.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (room) => {
    if (room?.posterImage?.url) return room.posterImage.url;
    if (room?.posterImage) return room.posterImage;
    if (room?.images && room.images.length > 0) {
      if (typeof room.images[0] === 'string') return room.images[0];
      if (room.images[0]?.url) return room.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center';
  };

  // Don't render if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading recommendations...</p>
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl mb-6 shadow-lg">
            <FontAwesomeIcon icon={faMagic} className="text-white text-2xl" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Recommended <span className="bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">For You</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized room suggestions based on your preferences and booking history
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(showMore ? recommendations : recommendations.slice(0, 3)).map((room) => (
            <div key={room._id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img 
                  src={getImageUrl(room)} 
                  alt={room.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Recommendation Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-lg">
                    <FontAwesomeIcon icon={faMagic} className="mr-1 text-xs" />
                    Recommended
                  </div>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                    <div className="flex items-center text-cyan-600 font-bold">
                      <FontAwesomeIcon icon={faRupeeSign} className="text-sm mr-1" />
                      <span className="text-lg">{room.price?.toLocaleString() || 'N/A'}</span>
                      <span className="text-xs text-gray-500 ml-1">/month</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-lg">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-sm mr-1" />
                      <span className="text-sm font-semibold text-gray-900">{room.rating || '4.5'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
                    {room.title}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-cyan-500 mr-2 text-sm" />
                    <span className="text-sm">
                      {room.location?.city && room.location?.address 
                        ? `${room.location.address}, ${room.location.city}` 
                        : room.location?.city || room.location?.address || 'Location not specified'}
                    </span>
                  </div>

                  {/* Recommendation Reason */}
                  {room.reason && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center text-purple-700">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-sm" />
                        <span className="text-sm font-medium">{room.reason}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faBed} className="mr-1" />
                      {room.roomType || 'Room'}
                    </span>
                    <span className="bg-cyan-50 text-cyan-700 px-2 py-1 rounded-full text-xs font-medium">
                      Score: {Math.round((room.recommendationScore || 0) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link 
                    to={`/room/${room._id}`}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-center py-3 px-4 rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-2" />
                    View Details
                  </Link>
                  
                  <button className="p-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-300">
                    <FontAwesomeIcon icon={faHeart} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        {recommendations.length > 3 && (
          <div className="text-center mt-12">
            {!showMore ? (
              <button
                onClick={() => setShowMore(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                View More Recommendations ({recommendations.length - 3} more)
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowMore(false)}
                  className="inline-flex items-center px-6 py-3 bg-white text-cyan-600 font-semibold rounded-xl border-2 border-cyan-600 hover:bg-cyan-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Show Less
                </button>
                <Link
                  to="/search"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold rounded-xl hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  Explore All Rooms
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationsSection;
