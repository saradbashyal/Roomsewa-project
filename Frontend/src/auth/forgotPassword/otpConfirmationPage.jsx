import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faArrowLeft, faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OtpConfirmationPage = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from previous page
  const email = location.state?.email || '';

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const { value } = e.target;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = Array(6).fill('');
        for (let i = 0; i < digits.length; i++) {
          newOtp[i] = digits[i];
        }
        setOtp(newOtp);
        
        // Focus the next empty input or last input
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex].focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    // Password validation
    if (!newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Password must include at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Password must include at least one lowercase letter.");
      return;
    }

    if (!/[@#$!%*?&]/.test(newPassword)) {
      toast.error("Password must include at least one special character.");
      return;
    }

    if (/\s/.test(newPassword)) {
      toast.error("Password cannot contain spaces.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      toast.error("Password must include at least one number.");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://roomsewa-project-production.up.railway.app/api/users/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpString,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    
    setResendLoading(true);
    
    try {
      const response = await fetch('https://roomsewa-project-production.up.railway.app/api/users/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New OTP sent to your email!');
        setTimer(60);
        setCanResend(false);
        setOtp(Array(6).fill(""));
        inputRefs.current[0].focus();
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cyan-50 px-4">
      <div className="w-full max-w-md bg-[#fefcfb] px-8 py-10 rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-cyan-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p className="text-gray-700">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-cyan-600 font-semibold">{email || 'your email address'}</p>
          <p className="text-gray-700 mt-1">Enter the code and your new password below</p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                disabled={loading}
              />
            ))}
          </div>

          {/* New Password Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-800 mb-2">
                New Password
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || otp.join('').length !== 6 || !newPassword || !confirmPassword}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="text-center mt-6">
          <p className="text-gray-700 mb-2">Didn't receive the code?</p>
          {canResend ? (
            <button 
              onClick={handleResend}
              disabled={resendLoading}
              className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          ) : (
            <p className="text-gray-600">
              Resend code in {timer}s
            </p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <NavLink 
            to="/forgotpassword" 
            className="inline-flex items-center text-gray-700 hover:text-cyan-600 font-medium hover:underline transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Forgot Password
          </NavLink>
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

export default OtpConfirmationPage;
