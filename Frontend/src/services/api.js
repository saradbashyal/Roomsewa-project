import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// Wishlist APIs
export const addToWishlist = async (roomId) => {
    try {
        const response = await api.post('/wishlist', { roomId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add to wishlist');
    }
};

export const getWishlist = async (userId) => {
    try {
        const response = await api.get(`/wishlist/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch wishlist');
    }
};

export const updateWishlistStatus = async (wishlistId, status) => {
    try {
        const response = await api.put(`/wishlist/${wishlistId}`, { status });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update wishlist status');
    }
};

export const removeFromWishlist = async (wishlistId) => {
    try {
        const response = await api.delete(`/wishlist/${wishlistId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
};

// Room APIs
export const getRooms = async () => {
    try {
        const response = await api.get('/rooms');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch rooms');
    }
};

// Booking APIs
export const createBooking = async (bookingData) => {
    try {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
};

// User APIs
export const loginUser = async (userData) => {
    try {
        const response = await api.post('/users/login', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/register', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

// Recommendation APIs
export const getRecommendations = async (limit = 6) => {
    try {
        const response = await api.get(`/recommendations?limit=${limit}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
};

export const getUserPreferences = async () => {
    try {
        const response = await api.get('/recommendations/preferences');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get user preferences');
    }
};

// Contact form API
export const submitContactForm = async (formData) => {
    try {
        const response = await api.post('/contact', formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send message');
    }
};