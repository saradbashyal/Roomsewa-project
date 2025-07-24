
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Search() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: '',
    budget: '',
    roomtype: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Create URL parameters from search data
    const params = new URLSearchParams();
    
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.budget) params.append('budget', searchData.budget);
    if (searchData.roomtype) params.append('roomtype', searchData.roomtype);
    
    // Navigate to search page with filters
    navigate(`/search?${params.toString()}`);
  };
  return (
    <section className="flex justify-center items-center py-12 px-4 bg-gradient-to-br from-cyan-50 to-blue-50">
      <form onSubmit={handleSearch} className="flex flex-wrap lg:flex-nowrap items-end gap-6 bg-white rounded-2xl max-w-5xl w-full shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col w-full lg:w-auto lg:flex-1">
          <label htmlFor="location" className="mb-2 text-sm font-semibold text-gray-700">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={searchData.location}
            onChange={handleInputChange}
            placeholder="Enter city or area"
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 text-gray-700"
          />
        </div>

        <div className="flex flex-col w-full lg:w-auto lg:flex-1">
          <label htmlFor="budget" className="mb-2 text-sm font-semibold text-gray-700">Budget Range</label>
          <select
            id="budget"
            name="budget"
            value={searchData.budget}
            onChange={handleInputChange}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 text-gray-700 bg-white"
          >
            <option value="">Select budget</option>
            <option value="0-5000">Below Rs. 5,000</option>
            <option value="5000-10000">Rs. 5,000 - 10,000</option>
            <option value="10000-20000">Rs. 10,000 - 20,000</option>
            <option value="20000+">Above Rs. 20,000</option>
          </select>
        </div>

        <div className="flex flex-col w-full lg:w-auto lg:flex-1">
          <label htmlFor="roomtype" className="mb-2 text-sm font-semibold text-gray-700">Room Type</label>
          <select
            id="roomtype"
            name="roomtype"
            value={searchData.roomtype}
            onChange={handleInputChange}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 text-gray-700 bg-white"
          >
            <option value="">Any type</option>
            <option value="single">Single Room</option>
            <option value="shared">Shared Room</option>
            <option value="1bhk">1 BHK</option>
            <option value="2bhk">2 BHK</option>
            <option value="3bhk">3 BHK</option>
            <option value="hostel">Hostel Room</option>
          </select>
        </div>

        <div className="w-full lg:w-auto">
          <button
            type="submit"
            className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-cyan-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🔍 Search Rooms
          </button>
        </div>
      </form>
    </section>
  );
}

export default Search;


