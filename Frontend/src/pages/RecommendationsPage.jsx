import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faMagic, 
  faUser,
  faHeart,
  faChartLine,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { getRecommendations, getUserPreferences } from '../services/api';
import RecommendationsSection from '../components/RecommendationsSection';
import { toast, ToastContainer } from 'react-toastify';

const RecommendationsPage = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const response = await getUserPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      toast.error('Failed to load user preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Header */}
      <header className="bg-cyan-50/80 backdrop-blur-lg border-b border-cyan-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="p-3 hover:bg-cyan-100 rounded-xl transition-colors duration-200"
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
                  <p className="text-xs text-gray-500">Your Recommendations</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/search"
                className="px-4 py-2 text-cyan-600 hover:bg-cyan-100 rounded-lg transition-colors"
              >
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl mb-6 shadow-lg">
            <FontAwesomeIcon icon={faMagic} className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Personal <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover rooms tailored to your preferences based on your booking history and interests
          </p>
        </div>

        {/* User Preferences Summary */}
        {!loading && preferences && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <div className="flex items-center mb-6">
              <FontAwesomeIcon icon={faUser} className="text-purple-600 text-xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Your Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {preferences.preferences.roomTypes.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Preferred Room Types</h3>
                  <div className="space-y-1">
                    {preferences.preferences.roomTypes.slice(0, 3).map((type, index) => (
                      <span key={index} className="block text-sm text-purple-600 capitalize">{type}</span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.preferences.cities.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Favorite Cities</h3>
                  <div className="space-y-1">
                    {preferences.preferences.cities.slice(0, 3).map((city, index) => (
                      <span key={index} className="block text-sm text-blue-600">{city}</span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.preferences.amenities.length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Loved Amenities</h3>
                  <div className="space-y-1">
                    {preferences.preferences.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="block text-sm text-green-600 capitalize">{amenity.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-cyan-50 rounded-xl p-4">
                <h3 className="font-semibold text-cyan-800 mb-2">Booking History</h3>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faChartLine} className="text-cyan-600 mr-2" />
                  <span className="text-sm text-cyan-600">{preferences.totalBookings} bookings made</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default RecommendationsPage;
