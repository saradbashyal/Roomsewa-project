import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faArrowLeft,
  faCloudUploadAlt,
  faMapMarkerAlt,
  faRupeeSign,
  faBed,
  faWifi,
  faCar,
  faCoffee,
  faEye,
  faSchool,
  faCouch,
  faTimes,
  faCheck,
  faUser,
  faHouse,
  faBuilding,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
    contactPhone: '',
    contactEmail: ''
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Check if user is logged in and has permission
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      toast.error('Please login to edit a property');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role === 'tenant') {
      toast.error('Only landlords can edit properties. Please contact admin to change your role.');
      navigate('/search');
    }
  }, [navigate]);

  // Fetch existing property data
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`roomsewa-project-production.up.railway.app/api/rooms/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch property data');
        }

        const data = await response.json();
        const room = data.data?.room || data.room || data;

        // Populate form with existing data
        setFormData({
          title: room.title || '',
          description: room.description || '',
          type: room.roomType || '',
          location: room.location?.address || room.location?.city || '',
          price: room.price ? room.price.toString() : '',
          bedrooms: room.bedrooms ? room.bedrooms.toString() : '',
          bathrooms: room.bathrooms ? room.bathrooms.toString() : '',
          area: room.area ? room.area.toString() : '',
          amenities: room.amenities || [],
          contactPhone: room.contactPhone || '',
          contactEmail: room.contactEmail || ''
        });

      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property data');
        navigate('/my-listings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPropertyData();
    }
  }, [user, id, navigate]);

  const propertyTypes = [
    { value: 'single', label: 'Single Room', icon: faBed },
    { value: 'shared', label: 'Shared Room', icon: faCouch },
    { value: '1bhk', label: '1 BHK', icon: faHome },
    { value: '2bhk', label: '2 BHK', icon: faBuilding },
    { value: '3bhk', label: '3 BHK', icon: faHouse },
    { value: 'hostel', label: 'Hostel Room', icon: faSchool }
  ];

  const availableAmenities = [
    { value: 'wifi', label: 'Wi-Fi', icon: faWifi },
    { value: 'air_conditioning', label: 'Air Conditioning', icon: faEye },
    { value: 'parking', label: 'Parking', icon: faCar },
    { value: 'kitchen', label: 'Kitchen', icon: faCoffee },
    { value: 'balcony', label: 'Balcony', icon: faEye },
    { value: 'furnished', label: 'Furnished', icon: faCouch }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.location || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.amenities.length === 0) {
      toast.error('Please select at least one amenity');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again to update the property');
        navigate('/login');
        return;
      }

      let posterImageUrl;
      
      // If user uploaded new images, convert first image to base64 data URL
      if (imageFiles.length > 0) {
        const reader = new FileReader();
        posterImageUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(imageFiles[0]);
        });
      }

      const roomData = {
        title: formData.title,
        description: formData.description || 'No description provided',
        price: Number(formData.price),
        location: {
          city: formData.location.split(',')[0]?.trim() || formData.location,
          address: formData.location
        },
        roomType: formData.type,
        amenities: formData.amenities
      };

      // Add poster image only if new image was uploaded
      if (posterImageUrl) {
        roomData.posterImage = {
          url: posterImageUrl
        };
      }

      // Add optional fields if provided
      if (formData.bedrooms) roomData.bedrooms = Number(formData.bedrooms);
      if (formData.bathrooms) roomData.bathrooms = Number(formData.bathrooms);
      if (formData.area) roomData.area = Number(formData.area);
      if (formData.contactPhone) roomData.contactPhone = formData.contactPhone;
      if (formData.contactEmail) roomData.contactEmail = formData.contactEmail;

      const response = await fetch(`roomsewa-project-production.up.railway.app/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update property';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast.success('Property updated successfully!');
      setTimeout(() => navigate('/my-listings'), 2000);

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error: Unable to connect to server. Please check if the backend is running.');
      } else {
        toast.error(`Failed to update property: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-500 text-lg font-medium">
            {loading ? 'Loading property data...' : 'Loading...'}
          </p>
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
              <Link 
                to="/my-listings" 
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
                  <p className="text-xs text-gray-500">Edit Property</p>
                </div>
              </Link>
            </div>

            {/* User info */}
            <div className="flex items-center space-x-3 bg-cyan-50/90 backdrop-blur-sm border border-cyan-200 rounded-xl px-4 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                <span className="text-xs text-cyan-600 capitalize">{user.role}</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Edit Property</h1>
            <p className="text-cyan-100 mt-2">Update your property details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Spacious 2BHK near Horizon chowk"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Golpark, Butwal"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe your property..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Property Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (NPR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faRupeeSign} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g., 25000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select bedrooms</option>
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select bathrooms</option>
                    <option value="1">1 Bathroom</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="3">3 Bathrooms</option>
                    <option value="4">4+ Bathrooms</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (sq ft)
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., 1200"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Amenities <span className="text-red-500">*</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableAmenities.map((amenity) => (
                  <div
                    key={amenity.value}
                    onClick={() => handleAmenityToggle(amenity.value)}
                    className={`
                      flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200
                      ${formData.amenities.includes(amenity.value)
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                  >
                    <FontAwesomeIcon 
                      icon={amenity.icon} 
                      className={formData.amenities.includes(amenity.value) ? 'text-cyan-600' : 'text-gray-400'}
                    />
                    <span className="text-sm font-medium">{amenity.label}</span>
                    {formData.amenities.includes(amenity.value) && (
                      <FontAwesomeIcon icon={faCheck} className="text-cyan-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+977 98xxxxxxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Property Images
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors duration-200">
                <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Upload new images to replace existing ones (Optional)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-6 py-3 bg-cyan-50 text-cyan-600 font-semibold rounded-xl hover:bg-cyan-100 cursor-pointer transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                  Choose Images
                </label>
                <p className="text-xs text-gray-500 mt-2">Max 5 images, up to 5MB each</p>
              </div>

              {/* Image Preview */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faTimes} className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/my-listings"
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={uploading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                <span>{uploading ? 'Updating Property...' : 'Update Property'}</span>
              </button>
            </div>
          </form>
        </div>
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

export default EditProperty;
