import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/users/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent to your email successfully!');
        // Navigate to OTP page with email
        setTimeout(() => {
          navigate('/otp', { state: { email } });
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cyan-50 px-4">
      <div className="w-full max-w-md bg-[#fefcfb] px-8 py-10 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="logo" className="h-16 w-16 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
          <div className="text-center text-gray-700">
            <p className="mb-1">
              Don't worry! Resetting your password is easy.
            </p>
            <p>
              Just enter the email you registered with RoomSewa.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending OTP...
              </div>
            ) : (
              'Send Reset Code'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-gray-700">
              Remembered your password?{" "}
              <NavLink 
                className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline transition-colors duration-200" 
                to="/login"
              >
                Sign In
              </NavLink>
            </p>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <NavLink 
              to="/login"
              className="inline-flex items-center text-gray-700 hover:text-cyan-600 font-medium hover:underline transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Login
            </NavLink>
          </div>
        </div>
      </div>

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

export default ForgotPassword;
