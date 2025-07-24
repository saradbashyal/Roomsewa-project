import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'admin') {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // If not admin, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.adminLogin(email, password);

      // Check if user has admin role
      if (data.role !== 'admin') {
        return { 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        };
      }

      // Store auth data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data));
      setUser(data);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      // Check if it's a network error
      if (error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please make sure the backend is running on localhost:3000' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
