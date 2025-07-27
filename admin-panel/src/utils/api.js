// API utility for admin panel
const API_BASE_URL = 'roomsewa-project-production.up.railway.app/api';

export const api = {
  // Admin login
  async adminLogin(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      // Return the user data with token
      return {
        token: data.token,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        userId: data.userId,
        avatar: data.avatar
      };
    } catch (error) {
      throw error;
    }
  },

  // Get authenticated request headers
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  },

  // Generic authenticated API call
  async authenticatedRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Admin Dashboard Stats
  async getDashboardStats() {
    return this.authenticatedRequest('/admin/stats');
  },

  // Get All Users
  async getAllUsers(page = 1, limit = 10) {
    return this.authenticatedRequest(`/admin/users?page=${page}&limit=${limit}`);
  },

  // Get All Rooms
  async getAllRooms(page = 1, limit = 10) {
    return this.authenticatedRequest(`/admin/rooms?page=${page}&limit=${limit}`);
  },

  // Approve Room
  async approveRoom(roomId) {
    return this.authenticatedRequest(`/admin/rooms/${roomId}/approve`, {
      method: 'PATCH'
    });
  },

  // Reject Room
  async rejectRoom(roomId) {
    return this.authenticatedRequest(`/admin/rooms/${roomId}/reject`, {
      method: 'PATCH'
    });
  },

  // Delete Room
  async deleteRoom(roomId) {
    return this.authenticatedRequest(`/admin/rooms/${roomId}`, {
      method: 'DELETE'
    });
  },

  // Get All Bookings
  async getAllBookings(page = 1, limit = 10) {
    return this.authenticatedRequest(`/admin/bookings?page=${page}&limit=${limit}`);
  },

  // Get Revenue Report
  async getRevenueReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.authenticatedRequest(`/admin/revenue-report?${params}`);
  },

  // Get Comprehensive Analytics
  async getComprehensiveAnalytics() {
    return this.authenticatedRequest('/admin/analytics/comprehensive');
  }
};
